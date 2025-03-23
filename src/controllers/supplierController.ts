import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";
import { getAuthUser } from "../utils/auth";
import { handleError } from "../utils/error";

export const createSupplierController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, contactEmail, contactPhone, address } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const supplier = await createSupplier(
      name,
      contactEmail,
      contactPhone,
      address,
      userId
    );
    res.status(201).json(supplier);
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const getSuppliersController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { page, limit, includeDeleted } = req.query;

  try {
    const result = await getSuppliers(
      page as string,
      limit as string,
      includeDeleted as string
    );
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
};

export const getSupplierByIdController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { supplierId } = req.params;

  try {
    const supplier = await getSupplierById(supplierId);
    res.json(supplier);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const updateSupplierController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { supplierId } = req.params;
  const { name, contactEmail, contactPhone, address } = req.body;
  const { id: userId } = getAuthUser(req);

  try {
    const supplier = await updateSupplier(
      supplierId,
      name,
      contactEmail,
      contactPhone,
      address,
      userId
    );
    res.json(supplier);
  } catch (err) {
    handleError(res, err as Error, 404);
  }
};

export const deleteSupplierController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { supplierId } = req.params;
  const { id: userId } = getAuthUser(req);

  try {
    const supplier = await deleteSupplier(supplierId, userId);
    res.json({ message: "Supplier soft deleted", supplier });
  } catch (err) {
    handleError(res, err as Error, 500);
  }
};