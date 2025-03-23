import express from "express";
import { getAnalyticsController } from "../controllers/adminController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.get(
  "/analytics",
  authMiddleware,
  adminMiddleware,
  getAnalyticsController
);

export { router as adminRoutes };