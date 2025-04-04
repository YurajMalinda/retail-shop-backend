import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getAuthUser } from "../utils/auth";
import { handleError } from "../utils/error";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../services/cartService";

export const getCartController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const cart = await getCart(userId.toString());
    res.json(cart);
  } catch (err) {
    handleError(res, err as Error);
  }
};

export const addToCartController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const cart = await addToCart(userId.toString(), productId, quantity || 1);
    res.json(cart);
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const updateCartItemController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const cart = await updateCartItem(userId.toString(), productId, quantity);
    res.json(cart);
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const removeFromCartController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId } = req.params;
  const { id: userId } = getAuthUser(req);

  try {
    const cart = await removeFromCart(userId.toString(), productId);
    res.json(cart);
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const clearCartController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id: userId } = getAuthUser(req);

  try {
    const cart = await clearCart(userId.toString());
    res.json(cart);
  } catch (err) {
    handleError(res, err as Error);
  }
};