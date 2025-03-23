import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { getAuthUser } from "../utils/auth";
import { handleError } from "../utils/error";

export const createCategoryController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, description } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const category = await createCategory(name, description, userId);
    res.status(201).json(category);
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const getCategoriesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { page, limit, includeDeleted } = req.query;

  try {
    const result = await getCategories(
      page as string,
      limit as string,
      includeDeleted as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
};

export const getCategoryByIdController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { categoryId } = req.params;

  try {
    const category = await getCategoryById(categoryId);
    res.json(category);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const updateCategoryController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { categoryId } = req.params;
  const { name, description } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const category = await updateCategory(
      categoryId,
      name,
      description,
      userId
    );
    res.json(category);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const deleteCategoryController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { categoryId } = req.params;
  const { id: userId } = getAuthUser(req);

  try {
    const category = await deleteCategory(categoryId, userId);
    res.json({ message: "Category soft deleted", category });
  } catch (err) {
    handleError(res, err as Error, 500);
  }
};