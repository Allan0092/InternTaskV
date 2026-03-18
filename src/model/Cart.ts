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

const findAndAddProductToCart = async (
  email: string,
  productId: number,
  quantityToAdd: number = 1,
) => {
  let cart = await prisma.cart.findFirst({
    where: { user: { email } },
    select: { cartId: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        user: { connect: { email } },
      },
      select: { cartId: true },
    });
  }

  const cartProduct = await prisma.cartProduct.upsert({
    where: {
      cartId_productId: {
        cartId: cart.cartId,
        productId,
      },
    },
    create: {
      cartId: cart.cartId,
      productId,
      quantity: quantityToAdd,
    },
    update: {
      quantity: { increment: quantityToAdd },
    },
  });

  return cartProduct;
};

export { findAllCart, findAndAddProductToCart, findCart };
