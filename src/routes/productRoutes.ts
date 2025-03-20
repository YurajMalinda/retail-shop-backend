import express from "express";
import { createProduct, getProducts } from "../controllers/productController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware(["admin"]), createProduct);
router.get("/", getProducts);

export { router as productRoutes };