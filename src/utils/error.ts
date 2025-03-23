import { Response } from "express";

export const handleError = (res: Response, err: Error, statusCode = 500) => {
  console.error(err.stack);
  res.status(statusCode).json({ message: err.message });
};