import mongoose from "mongoose";
import { Category } from "../models/categoryModel";
import { applySoftDelete } from "../utils/softDelete";
import { paginate } from "../utils/pagination";

export const createCategory = async (
  name: string,
  description: string,
  userId: mongoose.Types.ObjectId
) => {
  const category = new Category({ name, description, createdBy: userId });
  return await category.save();
};

export const getCategories = async (
  page: string,
  limit: string,
  includeDeleted: string
) => {
  const filter = includeDeleted === "true" ? {} : { deletedAt: null };
  return await paginate(Category, filter, page, limit);
};

export const getCategoryById = async (categoryId: string) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Category not found");
  return category;
};

export const updateCategory = async (
  categoryId: string,
  name: string,
  description: string,
  userId: mongoose.Types.ObjectId
) => {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { name, description, updatedBy: userId },
    { new: true }
  );
  if (!category) throw new Error("Category not found");
  return category;
};

export const deleteCategory = async (
  categoryId: string,
  userId: mongoose.Types.ObjectId
) => {
  return await applySoftDelete(Category, { _id: categoryId }, userId);
};