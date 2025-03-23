import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const orderDetailSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: () => dayjs().toDate() },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

orderDetailSchema.pre("save", async function (next) {
  if (this.isNew) {
    const product = await mongoose.model("Product").findById(this.product);
    if (!product || product.stock < this.quantity) {
      return next(new Error("Insufficient stock or invalid product"));
    }
    await mongoose
      .model("Product")
      .updateOne({ _id: this.product }, { $inc: { stock: -this.quantity } });
  }
  next();
});

orderDetailSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: dayjs().toDate() });
  next();
});

orderDetailSchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);