import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const paymentSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  transactionId: { type: String },
  errorMessage: { type: String },
  createdAt: { type: Date, default: () => dayjs().toDate() },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

paymentSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = dayjs().toDate();
  }
  next();
});

paymentSchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);