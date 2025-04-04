import express from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cartController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, getCartController);
router.post("/", authMiddleware, addToCartController);
router.put("/item", authMiddleware, updateCartItemController);
router.delete("/item/:productId", authMiddleware, removeFromCartController);
router.delete("/clear", authMiddleware, clearCartController);

export { router as cartRoutes };
