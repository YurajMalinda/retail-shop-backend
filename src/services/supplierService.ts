import mongoose from "mongoose";
import { Supplier } from "../models/supplierModel";
import { applySoftDelete } from "../utils/softDelete";
import { paginate } from "../utils/pagination";

export const createSupplier = async (
  name: string,
  contactEmail: string,
  contactPhone: string,
  address: any,
  userId: mongoose.Types.ObjectId
) => {
  const supplier = new Supplier({
    name,
    contactEmail,
    contactPhone,
    address,
    createdBy: userId,
  });
  return await supplier.save();
};

export const getSuppliers = async (
  page: string,
  limit: string,
  includeDeleted: string
) => {
  const filter = includeDeleted === "true" ? {} : { deletedAt: null };
  return await paginate(Supplier, filter, page, limit);
};

export const getSupplierById = async (supplierId: string) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) throw new Error("Supplier not found");
  return supplier;
};

export const updateSupplier = async (
  supplierId: string,
  name: string,
  contactEmail: string,
  contactPhone: string,
  address: any,
  userId: mongoose.Types.ObjectId
) => {
  const supplier = await Supplier.findByIdAndUpdate(
    supplierId,
    { name, contactEmail, contactPhone, address, updatedBy: userId },
    { new: true }
  );
  if (!supplier) throw new Error("Supplier not found");
  return supplier;
};

export const deleteSupplier = async (
  supplierId: string,
  userId: mongoose.Types.ObjectId
) => {
  return await applySoftDelete(Supplier, { _id: supplierId }, userId);
};