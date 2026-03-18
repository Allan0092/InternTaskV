import { OrderUpdateInput } from "@/generated/prisma/models.js";
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
    include: {
      orderItems: {
        select: {
          productId: true,
          price: true,
          quantity: true,
          orderItemId: true,
        },
      },
    },
  });
  return orders;
};

const findOrdersByEmail = async (
  email: string,
  page: number = 1,
  limit: number = 10,
  min: number = 0,
  max: number = 999999999,
) => {
  const order = await prisma.order.findMany({
    where: { user: { email: email } },
    orderBy: { orderDate: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: { orderItems: true },
  });
  return order;
};

const updateOrder = async (orderId: number, data: OrderUpdateInput) => {
  const order = await prisma.order.update({ where: { orderId }, data });
  return order;
};

export { findAllOrders, findOrdersByEmail, updateOrder };
