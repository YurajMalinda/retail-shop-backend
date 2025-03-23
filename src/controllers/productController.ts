import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getAuthUser } from "../utils/auth";
import { handleError } from "../utils/error";

export const createProductController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, price, stock, supplier, category } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const product = await createProduct(
      name,
      price,
      stock,
      supplier,
      category,
      userId
    );
    res.status(201).json(product);
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const getProductsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const {
    page,
    limit,
    includeDeleted,
    search,
    category,
    supplier,
    minPrice,
    maxPrice,
  } = req.query;

  try {
    const result = await getProducts(
      page as string,
      limit as string,
      includeDeleted as string,
      search as string,
      category as string,
      supplier as string,
      minPrice as string,
      maxPrice as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
};

export const getProductByIdController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId } = req.params;

  try {
    const product = await getProductById(productId);
    res.json(product);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const updateProductController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId } = req.params;
  const { name, price, stock, supplier, category } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const product = await updateProduct(
      productId,
      name,
      price,
      stock,
      supplier,
      category,
      userId
    );
    res.json(product);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const deleteProductController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId } = req.params;
  const { id: userId } = getAuthUser(req);

  try {
    const product = await deleteProduct(productId, userId);
    res.json({ message: "Product soft deleted", product });
  } catch (err) {
    handleError(res, err as Error, 500);
  }
};