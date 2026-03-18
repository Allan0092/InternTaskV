import { prisma } from "@/prisma/prisma.js";

const findAllOrders = async (
  page: number = 1,
  limit: number = 10,
  min: number = 0,
  max: number = 999999999,
) => {
  const orders = await prisma.order.findMany({
    orderBy: { orderDate: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    where: { Total: { gte: min, lte: max } },
  });
  return orders;
};

export { findAllOrders };
