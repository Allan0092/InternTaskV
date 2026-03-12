import { prisma } from "@/prisma/prisma.js";

const findAllCart = async () => {
  const cart = await prisma.cart.findMany({
    include: { cartProducts: true },
  });

  return cart;
};

const findCart = async (email: string) => {
  const cart = await prisma.cart.findFirst({
    where: { user: { email: email } },
    include: {
      cartProducts: {
        select: {
          product: { select: { name: true, price: true, description: true } },
          quantity: true,
        },
      },
    },
  });
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

export { findAllCart, findCart };
