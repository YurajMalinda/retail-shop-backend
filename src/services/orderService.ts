import mongoose from "mongoose";
import { Order } from "../models/orderModel";
import { OrderDetail } from "../models/orderDetailModel";
import { Product } from "../models/productModel";
import { Customer } from "../models/customerModel";
import { Payment } from "../models/paymentModel";
import { DummyPaymentGateway } from "./dummyPaymentGateway";
import { paginate } from "../utils/pagination";
import dayjs from "dayjs";
import { clearCart } from "./cartService";

export const createOrder = async (
  userId: string,
  items: { productId: string; quantity: number }[],
  shippingAddress: any
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findOne({ user: userId }).session(session);
    if (!customer) throw new Error("Customer profile not found");

    const order = new Order({
      customer: customer._id,
      shippingAddress,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    await order.save({ session });

    const orderDetails = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId).session(session);
        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Product ${product?.name || item.productId} out of stock`
          );
        }
        if (!product.supplier) {
          throw new Error(`Product ${product.name} is missing a supplier`);
        }
        product.stock -= item.quantity;
        await product.save({ session });
        return new OrderDetail({
          order: order._id,
          product: product._id,
          supplier: product.supplier,
          quantity: item.quantity,
          price: product.price,
          createdBy: new mongoose.Types.ObjectId(userId),
        });
      })
    );
    const savedDetails = await OrderDetail.insertMany(orderDetails, {
      session,
    });

    order.orderDetails = savedDetails.map((detail) => detail._id);
    order.total = savedDetails.reduce(
      (sum, detail) => sum + detail.quantity * detail.price,
      0
    );
    await order.save({ session });

    const paymentResult = await DummyPaymentGateway.processPayment(
      order._id.toString(),
      order.total
    );
    const payment = new Payment({
      order: order._id,
      amount: order.total,
      status: paymentResult.success ? "completed" : "failed",
      transactionId: paymentResult.transactionId,
      errorMessage: paymentResult.error,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    await payment.save({ session });

    if (paymentResult.success) {
      order.paymentStatus = "completed";
      order.status = "paid";
      order.transactionId = paymentResult.transactionId;
      await clearCart(userId); // Clear cart after successful payment
    } else {
      order.paymentStatus = "failed";
      order.status = "pending";
    }
    order.updatedBy = new mongoose.Types.ObjectId(userId);
    await order.save({ session });

    await session.commitTransaction();
    return { order, details: savedDetails, paymentResult };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getOrders = async (
  userId: string,
  role: string,
  status: string | undefined,
  includeDeleted: string,
  page: string,
  limit: string
) => {
  const filter: any =
    role === "admin" ? {} : { createdBy: new mongoose.Types.ObjectId(userId) };
  if (status) filter.status = status;
  if (includeDeleted !== "true") filter.deletedAt = null;

  const result = await paginate(Order, filter, page, limit, {
    path: "customer",
  });
  const orderIds = result.docs.map((order: any) => order._id);
  const details = await OrderDetail.find({ order: { $in: orderIds } }).populate(
    "product"
  );

  return {
    ...result,
    docs: result.docs.map((order: any) => ({
      ...order.toObject(),
      details: details.filter(
        (d) => d.order.toString() === order._id.toString()
      ),
    })),
  };
};

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    createdBy: new mongoose.Types.ObjectId(userId),
  })
    .populate("customer")
    .populate("createdBy", "email name");
  if (!order) throw new Error("Order not found");
  const details = await OrderDetail.find({ order: order._id }).populate(
    "product"
  );
  return { order, details };
};

export const updateOrder = async (
  orderId: string,
  userId: string,
  shippingAddress: any
) => {
  const order = await Order.findOne({
    _id: orderId,
    createdBy: new mongoose.Types.ObjectId(userId),
  });
  if (!order) throw new Error("Order not found");
  if (order.status !== "pending")
    throw new Error("Cannot update order after processing");

  order.shippingAddress = shippingAddress || order.shippingAddress;
  order.updatedBy = new mongoose.Types.ObjectId(userId);
  await order.save();
  const details = await OrderDetail.find({ order: order._id }).populate(
    "product"
  );
  return { order, details };
};

export const deleteOrder = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      createdBy: new mongoose.Types.ObjectId(userId),
    }).session(session);
    if (!order) throw new Error("Order not found");
    if (order.status !== "pending")
      throw new Error("Cannot delete order after processing");

    await Order.findByIdAndUpdate(
      orderId,
      {
        deletedAt: dayjs().toDate(),
        deletedBy: new mongoose.Types.ObjectId(userId),
      },
      { session }
    );

    const details = await OrderDetail.find({ order: order._id }).session(
      session
    );
    await Promise.all(
      details.map(async (detail) => {
        await Product.findByIdAndUpdate(
          detail.product,
          {
            $inc: { stock: detail.quantity },
            updatedBy: new mongoose.Types.ObjectId(userId),
          },
          { session }
        );
      })
    );

    await session.commitTransaction();
    return { message: "Order and details soft deleted" };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  trackingNumber: string | undefined,
  userId: mongoose.Types.ObjectId
) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status,
      ...(trackingNumber && status === "shipped" ? { trackingNumber } : {}),
      updatedAt: dayjs().toDate(),
      updatedBy: userId,
    },
    { new: true }
  );
  if (!order) throw new Error("Order not found");
  return order;
};

export const getOrderHistory = async (
  userId: string,
  page: string,
  limit: string,
  status: string | undefined
) => {
  const customer = await Customer.findOne({ user: userId });
  if (!customer) throw new Error("Customer profile not found");

  const filter: any = { customer: customer._id };
  if (status) filter.status = status;

  const result = await paginate(Order, filter, page, limit, {
    path: "customer",
  });
  const orderIds = result.docs.map((order: any) => order._id);
  const details = await OrderDetail.find({ order: { $in: orderIds } }).populate(
    "product"
  );

  return {
    ...result,
    docs: result.docs.map((order: any) => ({
      ...order.toObject(),
      details: details.filter(
        (d) => d.order.toString() === order._id.toString()
      ),
    })),
  };
};