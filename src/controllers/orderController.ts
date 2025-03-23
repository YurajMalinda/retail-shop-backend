import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderHistory,
} from "../services/orderService";
import { getAuthUser, restrictToAdmin } from "../utils/auth";
import { handleError } from "../utils/error";

export const createOrderController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { items, shippingAddress } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const result = await createOrder(userId.toString(), items, shippingAddress);
    res.status(201).json({
      order: result.order,
      details: result.details,
      payment: {
        success: result.paymentResult.success,
        transactionId: result.paymentResult.transactionId,
        error: result.paymentResult.error,
      },
    });
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const getOrdersController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { status, includeDeleted, page, limit } = req.query;
  const { id: userId, role } = getAuthUser(req);

  try {
    const result = await getOrders(
      userId.toString(),
      role,
      status as string,
      includeDeleted as string,
      page as string,
      limit as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
};

export const getOrderByIdController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { id: userId } = getAuthUser(req);

  try {
    const result = await getOrderById(orderId, userId.toString());
    res.json(result);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const updateOrderController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { shippingAddress } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const result = await updateOrder(
      orderId,
      userId.toString(),
      shippingAddress
    );
    res.json(result);
  } catch (err) {
    if (err instanceof Error) {
      handleError(res, err, err.message.includes("Cannot") ? 400 : 404);
    } else {
      handleError(res, new Error("Unknown error"), 400);
    }
  }
};

export const deleteOrderController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { id: userId } = getAuthUser(req);

  try {
    const result = await deleteOrder(orderId, userId.toString());
    res.json(result);
  } catch (err) {
    if (err instanceof Error) {
      handleError(res, err, err.message.includes("Cannot") ? 400 : 404);
    } else {
      handleError(res, new Error("Unknown error"), 400);
    }
  }
};

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { status, trackingNumber } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    restrictToAdmin(req);
    const order = await updateOrderStatus(
      orderId,
      status,
      trackingNumber,
      userId
    );
    res.json(order);
  } catch (err) {
    handleError(
      res,
      err as Error,
      (err as Error).message === "Admin access required" ? 403 : 404
    );
  }
};

export const getOrderHistoryController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { page, limit, status } = req.query;
  const { id: userId } = getAuthUser(req);

  try {
    const result = await getOrderHistory(
      userId.toString(),
      page as string,
      limit as string,
      status as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};
