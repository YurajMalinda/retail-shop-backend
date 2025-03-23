import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new Error("Admin access required"));
  }
  next();
};