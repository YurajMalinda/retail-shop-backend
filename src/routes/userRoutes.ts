import express from "express";
import {
  registerUserController,
  loginUserController,
  refreshTokenController,
  logoutUserController,
} from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutUserController);

export { router as userRoutes };