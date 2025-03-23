import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getAnalytics } from "../services/adminService";
import { restrictToAdmin } from "../utils/auth";
import { handleError } from "../utils/error";

export const getAnalyticsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { startDate, endDate, preset, filterBy } = req.query;

  try {
    restrictToAdmin(req);
    const analytics = await getAnalytics(
      startDate as string,
      endDate as string,
      preset as string,
      filterBy as string
    );
    res.json(analytics);
  } catch (err) {
    if (err instanceof Error) {
      handleError(res, err, err.message.includes("Invalid") ? 400 : 500);
    } else {
      handleError(res, new Error("Unknown error"), 500);
    }
  }
};