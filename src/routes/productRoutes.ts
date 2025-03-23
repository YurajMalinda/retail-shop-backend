import express from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createProductController);
router.get("/", getProductsController);
router.get("/:productId", getProductByIdController);
router.put(
  "/:productId",
  authMiddleware,
  adminMiddleware,
  updateProductController
);
router.delete(
  "/:productId",
  authMiddleware,
  adminMiddleware,
  deleteProductController
);

export { router as productRoutes };