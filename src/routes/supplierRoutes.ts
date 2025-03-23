import express from "express";
import {
  createSupplierController,
  getSuppliersController,
  getSupplierByIdController,
  updateSupplierController,
  deleteSupplierController,
} from "../controllers/supplierController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createSupplierController);
router.get("/", getSuppliersController);
router.get("/:supplierId", getSupplierByIdController);
router.put(
  "/:supplierId",
  authMiddleware,
  adminMiddleware,
  updateSupplierController
);
router.delete(
  "/:supplierId",
  authMiddleware,
  adminMiddleware,
  deleteSupplierController
);

export { router as supplierRoutes };