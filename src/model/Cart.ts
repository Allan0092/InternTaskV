import { prisma } from "@/prisma/prisma.js";

const findCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId: userId } });
  return cart;
};

const findAndInsertProductInCart = async (
  userId: number,
  productId: number,
) => {
  //   const cart = await prisma.cart.update({
  //     where: { userId: userId },
  //     data: { items: ,
  //   });
};

export { findCart };
