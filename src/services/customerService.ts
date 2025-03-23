import mongoose from "mongoose";
import { Customer } from "../models/customerModel";
import { Order } from "../models/orderModel";
import { applySoftDelete } from "../utils/softDelete";
import { paginate } from "../utils/pagination";
import dayjs from "dayjs";

export const getCustomers = async (
  page: string,
  limit: string,
  includeDeleted: string
) => {
  const filter = includeDeleted === "true" ? {} : { deletedAt: null };
  return await paginate(Customer, filter, page, limit, [
    { path: "user", select: "email name" },
  ]); // Array of PopulateOptions
};

export const getCustomerById = async (customerId: string) => {
  const customer = await Customer.findById(customerId).populate(
    "user",
    "email name"
  );
  if (!customer) throw new Error("Customer not found");
  return customer;
};

export const updateCustomer = async (
  userId: string,
  phone: string,
  billingAddress: any
) => {
  const customer = await Customer.findOneAndUpdate(
    { user: userId },
    { phone, billingAddress, updatedAt: dayjs().toDate() },
    { new: true }
  );
  if (!customer) throw new Error("Customer not found");
  return customer;
};

export const deleteCustomer = async (userId: string) => {
  const customer = await applySoftDelete(
    Customer,
    { user: userId },
    new mongoose.Types.ObjectId(userId)
  );
  const orderCount = await Order.countDocuments({ customer: customer._id });
  return { customer, orderCount };
};