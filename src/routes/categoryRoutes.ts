import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/categoryController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware(["admin"]), createCategory);
router.get("/", getCategories);

export { router as categoryRoutes };