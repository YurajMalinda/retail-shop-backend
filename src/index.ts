import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { authRoutes } from "./routes/authRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { productRoutes } from "./routes/productRoutes";
import { Request, Response, Application } from "express";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Fix: Use app.get() with proper typing
app.get("/", (_req: Request, res: Response) => {
  res.send("E-commerce API running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));