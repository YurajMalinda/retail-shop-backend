import { Payment } from "../models/paymentModel";
import { Customer } from "../models/customerModel";
import { Order } from "../models/orderModel";
import { paginate } from "../utils/pagination";

export const getPayments = async (
  userId: string,
  role: string,
  orderId: string | undefined,
  page: string,
  limit: string,
  includeDeleted: string
) => {
  const filter: any = includeDeleted === "true" ? {} : { deletedAt: null };
  if (orderId) filter.order = orderId;
  if (role !== "admin") {
    const customer = await Customer.findOne({ user: userId });
    if (!customer) throw new Error("Customer profile not found");
    const orders = await Order.find({ customer: customer._id });
    filter.order = { $in: orders.map((o) => o._id) };
  }

  // Pass PopulateOptions object instead of string
  return await paginate(Payment, filter, page, limit, { path: "order" });
};

export const getPaymentById = async (
  paymentId: string,
  userId: string,
  role: string
) => {
  const payment = await Payment.findById(paymentId).populate("order");
  if (!payment) throw new Error("Payment not found");
  if (role !== "admin") {
    const customer = await Customer.findOne({ user: userId });
    if (!customer) throw new Error("Customer profile not found");
    const order = await Order.findOne({
      _id: payment.order,
      customer: customer._id,
    });
    if (!order) throw new Error("Unauthorized");
  }
  return payment;
};