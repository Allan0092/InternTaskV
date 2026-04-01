import { prisma } from "@/prisma/prisma.js";
import { AppError } from "@/types/index.js";

const findAllCart = async (page: number = 1, limit: number = 10) => {
  const cart = await prisma.cart.findMany({
    include: { cartProducts: true },
    orderBy: { id: "asc" },
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
    omit: { id: true, userId: true },
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
    select: { id: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        user: { connect: { email } },
      },
      select: { id: true },
    });
  }

  const cartProduct = await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    create: {
      cartId: cart.id,
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
  const result = await prisma.cartItem.delete({
    where: { id: cartProductId },
  });

  return result;
};

const findCartByEmail = async (email: string) => {
  const cart = await prisma.cart.findFirst({
    where: { user: { email } },
    include: {
      cartProducts: {
        include: {
          product: {
            select: { id: true, price: true },
          },
        },
      },
    },
  });
  return cart;
};

const clearCart = async (cartId: number) => {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });
};

export {
  clearCart,
  findAllCart,
  findAndAddProductToCart,
  findAndRemoveProductFromCart,
  findCart,
  findCartByEmail,
};
