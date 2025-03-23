import mongoose from "mongoose";
import { Product } from "../models/productModel";
import { applySoftDelete } from "../utils/softDelete";
import { paginate } from "../utils/pagination";

export const createProduct = async (
  name: string,
  price: number,
  stock: number,
  supplier: string,
  category: string,
  userId: mongoose.Types.ObjectId
) => {
  const product = new Product({
    name,
    price,
    stock,
    supplier,
    category,
    createdBy: userId,
  });
  return await product.save();
};

export const getProducts = async (
  page: string,
  limit: string,
  includeDeleted: string,
  search: string | undefined,
  category: string | undefined,
  supplier: string | undefined,
  minPrice: string | undefined,
  maxPrice: string | undefined
) => {
  const filter: any = includeDeleted === "true" ? {} : { deletedAt: null };
  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return await paginate(Product, filter, page, limit, [
    { path: "supplier", select: "name" },
    { path: "category", select: "name" },
  ]);
};

export const getProductById = async (productId: string) => {
  const product = await Product.findById(productId)
    .populate("supplier", "name")
    .populate("category", "name");
  if (!product) throw new Error("Product not found");
  return product;
};

export const updateProduct = async (
  productId: string,
  name: string,
  price: number,
  stock: number,
  supplier: string,
  category: string,
  userId: mongoose.Types.ObjectId
) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { name, price, stock, supplier, category, updatedBy: userId },
    { new: true }
  );
  if (!product) throw new Error("Product not found");
  return product;
};

export const deleteProduct = async (
  productId: string,
  userId: mongoose.Types.ObjectId
) => {
  return await applySoftDelete(Product, { _id: productId }, userId);
};