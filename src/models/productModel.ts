import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const productSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: { type: Date, default: () => dayjs().toDate() },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

productSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: dayjs().toDate() });
  next();
});

productSchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const Product = mongoose.model("Product", productSchema);
