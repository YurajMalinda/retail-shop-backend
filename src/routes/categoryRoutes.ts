import express from "express";
import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createCategoryController);
router.get("/", getCategoriesController);
router.get("/:categoryId", getCategoryByIdController);
router.put(
  "/:categoryId",
  authMiddleware,
  adminMiddleware,
  updateCategoryController
);
router.delete(
  "/:categoryId",
  authMiddleware,
  adminMiddleware,
  deleteCategoryController
);

export { router as categoryRoutes };