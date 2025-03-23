import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "guest"], default: "user" },
  createdAt: { type: Date, default: () => dayjs().toDate() },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

export const User = mongoose.model("User", userSchema);