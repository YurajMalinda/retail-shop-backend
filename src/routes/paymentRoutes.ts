import express from "express";
import {
  getPaymentsController,
  getPaymentByIdController,
} from "../controllers/paymentController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, getPaymentsController);
router.get("/:paymentId", authMiddleware, getPaymentByIdController);

export { router as paymentRoutes };