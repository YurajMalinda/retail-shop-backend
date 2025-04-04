import mongoose from "mongoose";
import dayjs from "dayjs";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  createdAt: { type: Date, default: () => dayjs().toDate() },
  updatedAt: { type: Date },
});

cartSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = dayjs().toDate();
  }
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);