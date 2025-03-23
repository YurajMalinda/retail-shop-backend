import mongoose from "mongoose";
import dayjs from "dayjs";

export const softDeletePlugin = (schema: mongoose.Schema) => {
  schema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate() as { deletedAt?: Date };
    if (update?.deletedAt) {
      this.set({ updatedAt: dayjs().toDate() });
    }
    next();
  });
  schema.pre(["find", "findOne"], function (next) {
    this.where({ deletedAt: null });
    next();
  });
};

export const applySoftDelete = async (
  model: mongoose.Model<any>,
  query: any,
  userId: mongoose.Types.ObjectId
) => {
  const doc = await model.findOneAndUpdate(
    query,
    { deletedAt: dayjs().toDate(), deletedBy: userId },
    { new: true }
  );
  if (!doc) throw new Error(`${model.modelName} not found`);
  return doc;
};