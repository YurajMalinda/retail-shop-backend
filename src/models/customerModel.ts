import mongoose from "mongoose";
import dayjs from "dayjs";

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  phone: { type: String },
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  createdAt: { type: Date, default: () => dayjs().toDate() },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

customerSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = dayjs().toDate();
  }
  next();
});

customerSchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const Customer = mongoose.model("Customer", customerSchema);