import express from "express";
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrderController,
  deleteOrderController,
  updateOrderStatusController,
  getOrderHistoryController,
} from "../controllers/orderController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, createOrderController);
router.get("/", authMiddleware, getOrdersController);
router.get("/history", authMiddleware, getOrderHistoryController);
router.get("/:orderId", authMiddleware, getOrderByIdController);
router.put("/:orderId", authMiddleware, updateOrderController);
router.delete("/:orderId", authMiddleware, deleteOrderController);
router.put(
  "/:orderId/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatusController
);

export { router as orderRoutes };