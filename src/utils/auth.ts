import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

export const getAuthUser = (req: AuthRequest) => {
  if (!req.user) throw new Error("Unauthorized");
  return { id: new mongoose.Types.ObjectId(req.user.id), role: req.user.role };
};

export const restrictToAdmin = (req: AuthRequest) => {
  const { role } = getAuthUser(req);
  if (role !== "admin") throw new Error("Admin access required");
};