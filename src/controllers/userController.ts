import { Request, Response } from "express";
import { handleError } from "../utils/error";
import { registerUser, loginUser, refreshTokenService, logoutUser } from "../services/userService.";

export const registerUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, name, role } = req.body;

  try {
    const { user, accessToken, refreshToken } = await registerUser(
      email,
      password,
      name,
      role
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user, accessToken });
  } catch (err) {
    handleError(res, err as Error, 400);
  }
};

export const loginUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { user, accessToken, refreshToken } = await loginUser(
      email,
      password
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ user, accessToken });
  } catch (err) {
    if (err instanceof Error) {
      handleError(
        res,
        err,
        err.message === "Invalid email or password" ? 401 : 500
      );
    } else {
      handleError(res, new Error("Unknown error"), 500);
    }
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token required" });
    return;
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenService(refreshToken);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (err) {
    if (err instanceof Error) {
      handleError(res, err, err.message.includes("Invalid") ? 403 : 500);
    } else {
      handleError(res, new Error("Unknown error"), 500);
    }
  }
};

export const logoutUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token required" });
    return;
  }

  try {
    const result = await logoutUser(refreshToken);
    res.clearCookie("refreshToken");
    res.json(result);
  } catch (err) {
    handleError(res, err as Error, 403);
  }
};