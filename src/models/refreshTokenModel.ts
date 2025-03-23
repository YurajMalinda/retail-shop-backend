import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  deviceInfo: { type: String },
  revoked: { type: Boolean, default: false },
});

// Optional: Auto-expire tokens using MongoDB TTL index
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
