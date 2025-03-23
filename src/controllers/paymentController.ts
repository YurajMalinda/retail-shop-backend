import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getPayments, getPaymentById } from "../services/paymentService";
import { getAuthUser } from "../utils/auth";
import { handleError } from "../utils/error";

export const getPaymentsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { orderId, page, limit, includeDeleted } = req.query;
  const { id: userId, role } = getAuthUser(req);

  try {
    const result = await getPayments(
      userId.toString(),
      role,
      orderId as string,
      page as string,
      limit as string,
      includeDeleted as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const getPaymentByIdController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { paymentId } = req.params;
  const { id: userId, role } = getAuthUser(req);

  try {
    const payment = await getPaymentById(paymentId, userId.toString(), role);
    res.json(payment);
  } catch (err) {
    if (err instanceof Error) {
      handleError(res, err, err.message === "Unauthorized" ? 403 : 404);
    } else {
      handleError(res, new Error("Unknown error"), 404);
    }
  }
};