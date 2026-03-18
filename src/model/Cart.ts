import { prisma } from "@/prisma/prisma.js";
import { AppError } from "@/types/index.js";

const findAllCart = async (page: number = 1, limit: number = 10) => {
  const cart = await prisma.cart.findMany({
    include: { cartProducts: true },
    orderBy: { cartId: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return cart;
};

const findCart = async (
  email: string,
  page: number = 1,
  limit: number = 10,
) => {
  const cart = await prisma.cart.findFirst({
    where: { user: { email: email } },
    include: {
      cartProducts: {
        select: {
          id: true,
          product: {
            select: { name: true, price: true, description: true },
          },
          quantity: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      },
    },
    omit: { cartId: true, userId: true },
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

const findAndRemoveProductFromCart = async (
  email: string,
  cartProductId: number,
) => {
  const cart = await prisma.cart.findFirst({
    where: { user: { email: email } },
  });
  if (!cart) throw new AppError("Cart is empty", 404);
  const result = await prisma.cartProduct.delete({
    where: { id: cartProductId },
  });

  return result;
};

export {
  findAllCart,
  findAndAddProductToCart,
  findAndRemoveProductFromCart,
  findCart,
};
