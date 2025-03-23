import mongoose from "mongoose";

export const paginate = async <T>(
  model: mongoose.Model<T>,
  filter: any,
  page: string | number = 1,
  limit: string | number = 10,
  populate?: string | mongoose.PopulateOptions | mongoose.PopulateOptions[] // Updated type
) => {
  const skip = (Number(page) - 1) * Number(limit);
  const total = await model.countDocuments(filter);
  let query = model.find(filter).skip(skip).limit(Number(limit));

  if (populate) {
    if (typeof populate === "string") {
      query = query.populate(populate); // Handle string shorthand
    } else {
      query = query.populate(populate); // Handle PopulateOptions or array
    }
  }

  const docs = await query.exec();

  return {
    docs,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};