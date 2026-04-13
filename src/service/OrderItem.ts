import { OrderItemUpdateInput } from "@/generated/prisma/models.js";
import { prisma } from "@/prisma/prisma.js";

const findOrderItem = async (id: number) => {
  const orderItem = await prisma.orderItem.findUnique({ where: { id } });
  return orderItem;
};

const findAndUpdateOrderItem = async (
  id: number,
  data: OrderItemUpdateInput,
) => {
  const orderItem = await prisma.orderItem.update({ where: { id }, data });
  return orderItem;
};

export { findAndUpdateOrderItem, findOrderItem };
