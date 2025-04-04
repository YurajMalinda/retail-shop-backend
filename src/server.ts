import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { orderRoutes } from "./routes/orderRoutes";
import { productRoutes } from "./routes/productRoutes";
import { supplierRoutes } from "./routes/supplierRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { customerRoutes } from "./routes/customerRoutes";
import { userRoutes } from "./routes/userRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { cartRoutes } from "./routes/cartRoutes";

dotenv.config();

const app = express();

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce"
    );
    console.log("Connected to MongoDB");

    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/orders", orderRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/suppliers", supplierRoutes);
    app.use("/api/categories", categoryRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/customers", customerRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/cart", cartRoutes);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      if (
        err.message === "No token provided" ||
        err.message === "Invalid token"
      ) {
        res.status(401).json({ message: err.message });
      } else if (err.message === "Admin access required") {
        res.status(403).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Server error", error: err.message });
      }
    });

    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  } catch (err) {
    console.error("Server startup error:", err);
  }
};

startServer();