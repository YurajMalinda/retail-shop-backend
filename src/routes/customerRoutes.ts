import express from "express";
import {
  getCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  deleteCustomerController,
} from "../controllers/customerController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getCustomersController);
router.get("/:customerId", authMiddleware, getCustomerByIdController);
router.put("/", authMiddleware, updateCustomerController);
router.delete("/", authMiddleware, deleteCustomerController);

export { router as customerRoutes };