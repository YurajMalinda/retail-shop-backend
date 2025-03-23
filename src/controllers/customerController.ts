import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";
import { getAuthUser, restrictToAdmin } from "../utils/auth";
import { handleError } from "../utils/error";

export const getCustomersController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { page, limit, includeDeleted } = req.query;

  try {
    restrictToAdmin(req);
    const result = await getCustomers(
      page as string,
      limit as string,
      includeDeleted as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
};

export const getCustomerByIdController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { customerId } = req.params;
  const { id: userId, role } = getAuthUser(req);

  try {
    const customer = await getCustomerById(customerId);
    if (role !== "admin" && customer.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }
    res.json(customer);
  } catch (err) {
    if (err instanceof Error) {
      handleError(res, err, err.message === "Unauthorized" ? 403 : 404);
    } else {
      handleError(res, new Error("Unknown error"), 500);
    }
  }
};

export const updateCustomerController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { phone, billingAddress } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const customer = await updateCustomer(
      userId.toString(),
      phone,
      billingAddress
    );
    res.json(customer);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const deleteCustomerController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id: userId } = getAuthUser(req);

  try {
    const { customer, orderCount } = await deleteCustomer(userId.toString());
    res.json({
      message: `Customer soft deleted. ${orderCount} associated orders remain.`,
      customer,
    });
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};