import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const categorySchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: () => dayjs().toDate() },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

categorySchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = dayjs().toDate();
  }
  next();
});

categorySchema.pre(["find", "findOne"], function (next) {
  this.where({ deletedAt: null });
  next();
});

export const Category = mongoose.model("Category", categorySchema);