import { Order } from "../models/orderModel";
import { OrderDetail } from "../models/orderDetailModel";
import { Payment } from "../models/paymentModel";
import dayjs from "dayjs";

export const getAnalytics = async (
  startDate: string | undefined,
  endDate: string | undefined,
  preset: string | undefined,
  filterBy: string = "createdAt"
) => {
  const dateFilter: any = { deletedAt: null };
  let start: string | undefined = startDate;
  let end: string | undefined = endDate;

  if (preset) {
    const now = dayjs();
    switch (preset) {
      case "last7days":
        start = now.subtract(7, "day").format("YYYY-MM-DD");
        end = now.format("YYYY-MM-DD");
        break;
      case "last30days":
        start = now.subtract(30, "day").format("YYYY-MM-DD");
        end = now.format("YYYY-MM-DD");
        break;
      case "thisMonth":
        start = now.startOf("month").format("YYYY-MM-DD");
        end = now.endOf("month").format("YYYY-MM-DD");
        break;
      default:
        throw new Error(
          "Invalid preset. Use 'last7days', 'last30days', or 'thisMonth'"
        );
    }
  }

  if (start && !dayjs(start).isValid())
    throw new Error("Invalid startDate format. Use YYYY-MM-DD");
  if (end && !dayjs(end).isValid())
    throw new Error("Invalid endDate format. Use YYYY-MM-DD");

  const dateField = filterBy === "updatedAt" ? "updatedAt" : "createdAt";
  if (start) dateFilter[dateField] = { $gte: dayjs(start).toDate() };
  if (end)
    dateFilter[dateField] = {
      ...dateFilter[dateField],
      $lte: dayjs(end).endOf("day").toDate(),
    };

  const totalSales = await Order.aggregate([
    { $match: { status: "paid", ...dateFilter } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const orderStats = await Order.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const topProducts = await OrderDetail.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$product", totalQuantity: { $sum: "$quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $project: { name: "$product.name", totalQuantity: 1 } },
  ]);

  const paymentStats = await Payment.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    totalSales: totalSales[0]?.total || 0,
    orderStats: orderStats.reduce(
      (acc, stat) => ({ ...acc, [stat._id]: stat.count }),
      {}
    ),
    topProducts,
    paymentStats: paymentStats.reduce(
      (acc, stat) => ({ ...acc, [stat._id]: stat.count }),
      {}
    ),
    dateRange: {
      start: start || "all time",
      end: end || "all time",
      filterBy: dateField,
    },
  };
};