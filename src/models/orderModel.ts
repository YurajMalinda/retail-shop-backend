import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const orderSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  orderNumber: { type: String, unique: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  total: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  transactionId: { type: String },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  trackingNumber: { type: String },
  orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderDetail" }],
  createdAt: { type: Date, default: () => dayjs().toDate() },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose
      .model("Order")
      .countDocuments({ deletedAt: null });
    this.orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`;
  } else {
    const details = await mongoose
      .model("OrderDetail")
      .find({ order: this._id, deletedAt: null });
    this.total = details.reduce(
      (sum, detail) => sum + detail.quantity * detail.price,
      0
    );
    this.updatedAt = dayjs().toDate();
  }
  next();
});

// Fixed pre("findOneAndUpdate") middleware
orderSchema.pre("findOneAndUpdate", async function (next) {
  // Set updatedAt
  this.set({ updatedAt: dayjs().toDate() });

  // Type the update object and check for deletedAt
  const update = this.getUpdate() as {
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
  };
  if (update && "deletedAt" in update && update.deletedAt) {
    await mongoose
      .model("OrderDetail")
      .updateMany(
        { order: this.getQuery()._id },
        { deletedAt: dayjs().toDate(), deletedBy: update.deletedBy }
      );
  }
  next();
});

orderSchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const Order = mongoose.model("Order", orderSchema);