import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const supplierSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  createdAt: { type: Date, default: () => dayjs().toDate() },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

supplierSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = dayjs().toDate();
  }
  next();
});

supplierSchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const Supplier = mongoose.model("Supplier", supplierSchema);