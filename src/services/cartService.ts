import mongoose from "mongoose";
import { Cart } from "../models/cartModel";
import { Product } from "../models/productModel";
import dayjs from "dayjs";

export const getCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price stock supplier category",
  });
  return cart || { user: userId, items: [] };
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product || product.stock < quantity) {
      throw new Error("Product not found or insufficient stock");
    }

    let cart = await Cart.findOne({ user: userId }).session(session);
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save({ session });
    await session.commitTransaction();
    return await getCart(userId);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex === -1) throw new Error("Item not found in cart");

  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  return await getCart(userId);
};

export const removeFromCart = async (userId: string, productId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );
  await cart.save();
  return await getCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return { user: userId, items: [] };
};
