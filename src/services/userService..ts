import { User } from "../models/userModel";
import { Customer } from "../models/customerModel";
import { RefreshToken } from "../models/refreshTokenModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dayjs from "dayjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const generateRefreshToken = () => crypto.randomBytes(32).toString("hex");

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already in use");

  const user = new User({ email, password, name, role: role || "user" });
  await user.save();

  if (role !== "admin") {
    const customer = new Customer({ user: user._id });
    await customer.save();
  }

  const refreshToken = generateRefreshToken();
  await new RefreshToken({
    token: refreshToken,
    user: user._id,
    expiresAt: dayjs().add(30, "day").toDate(),
  }).save();

  const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    user: { id: user._id, email, name, role },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  const refreshToken = generateRefreshToken();
  await new RefreshToken({
    token: refreshToken,
    user: user._id,
    expiresAt: dayjs().add(30, "day").toDate(),
  }).save();

  const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    user: { id: user._id, email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (refreshToken: string) => {
  const tokenDoc = await RefreshToken.findOne({
    token: refreshToken,
    revoked: false,
  });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(tokenDoc.user);
  if (!user) throw new Error("User not found");

  const newAccessToken = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const newRefreshToken = generateRefreshToken();
  await new RefreshToken({
    token: newRefreshToken,
    user: user._id,
    expiresAt: dayjs().add(30, "day").toDate(),
  }).save();

  tokenDoc.revoked = true;
  await tokenDoc.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken: string) => {
  const tokenDoc = await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { revoked: true }
  );
  if (!tokenDoc) throw new Error("Invalid refresh token");
  return { message: "Logged out successfully" };
};