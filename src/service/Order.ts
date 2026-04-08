import { OrderStatus } from "@/generated/prisma/enums.js";
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
          id: true,
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
    include: {
      orderItems: true,
      payments: { select: { status: true, id: true } },
    },
    omit: { paymentId: true },
  });
  return order;
};

const findAndUpdateOrder = async (orderId: number, data: OrderUpdateInput) => {
  const order = await prisma.order.update({ where: { id: orderId }, data });
  return order;
};

const findSellersOrder = async (
  email: string,
  status: OrderStatus = OrderStatus.PENDING,
) => {
  const orders = await prisma.order.findMany({
    where: {
      status,
      orderItems: {
        some: {
          product: {
            user: {
              email,
            },
          },
        },
      },
    },
    orderBy: { orderDate: "desc" },
    include: {
      orderItems: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      payments: true,
    },
  });
  return orders;
};

const findOrderSellers = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      orderItems: {
        select: {
          product: {
            select: {
              user: true, // seller
            },
          },
        },
      },
    },
  });

  if (!order) return [];

  const sellers = order.orderItems
    .map((item) => item.product.user)
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  const uniqueSellers = Array.from(
    new Map(sellers.map((s) => [s.id, s])).values(),
  );

  return uniqueSellers;
};

const findOrderById = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true, payments: true },
  });
  return order;
};

const saveOrder = async (email: string, orderItems: any[]) => {
  // Calculate total price
  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const order = await prisma.order.create({
    data: {
      Total: total,
      status: OrderStatus.PENDING,
      user: { connect: { email } },
      orderItems: {
        createMany: {
          data: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    },
  });
  return order.id;
};

const findOrderBySku = async (sku: string) => {
  const order = await prisma.order.findUnique({ where: { sku } });
  return order;
};

const findOrderProductsBySku = async (sku: string) => {
  const products = await prisma.order.findUniqueOrThrow({
    where: { sku },
    select: {
      orderItems: { select: { product: true, quantity: true, price: true } },
    },
  });
  return products.orderItems;
};

const findOrderProductsAndSellersBySku = async (sku: string) => {
  const products = await prisma.order.findUniqueOrThrow({
    where: { sku },
    select: {
      orderItems: {
        select: {
          product: { include: { user: { select: { email: true } } } },
          quantity: true,
          price: true,
        },
      },
    },
  });
  return products.orderItems;
};

export {
  findAllOrders,
  findAndUpdateOrder,
  findOrderById,
  findOrderBySku,
  findOrderProductsAndSellersBySku,
  findOrderProductsBySku,
  findOrdersByEmail,
  findOrderSellers,
  findSellersOrder,
  saveOrder,
};
