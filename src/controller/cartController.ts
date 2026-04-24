import {
  findAllCart,
  findAndAddProductToCart,
  findAndRemoveProductFromCart,
  findCart,
  findCartByEmail,
} from "@/service/Cart.js";
import { findProduct } from "@/service/Product.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { Context, Next } from "koa";

const getCart = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const email = ctx.state.user.email;
    const cart = await findCart(email, page, limit);
    ctx.body = generateResponseBody({
      success: true,
      message: "Cart fetched successfully.",
      data: cart ?? [],
    });
  } catch (e: Error | AppError | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "could not get cart",
    });
    throw e;
  }
};

// Admin User
const getAllCart = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const cart = await findAllCart(page, limit);
    ctx.body = generateResponseBody({
      success: true,
      message: "Cart retrieved successfully.",
      data: cart,
    });
  } catch (e: Error | AppError | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "could not get cart",
    });
    throw e;
  }
};

const checkCartProductInStock = async (ctx: Context, next: Next) => {
  try {
    const email = ctx.state.user.email;
    const cart = await findCartByEmail(email);
    if (!cart || cart.cartProducts.length === 0)
      throw new AppError("Could not find cart");
    ctx.state.cart = cart;

    for (const cartItem of cart.cartProducts) {
      const product = await findProduct(cartItem.product.id);
      if (product.quantity <= 0)
        throw new AppError(`"${product.name}" is out of stock`, 400);
      if (product.quantity < cartItem.quantity)
        throw new AppError(`Insufficient stock for "${product.name}"`, 400);
    }

    await next();

    // ctx.body = generateResponseBody({
    //   success: true,
    //   message: "All items are in stock.",
    // });
  } catch (e: Error | AppError | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not check stock",
    });
    throw e;
  }
};

const addProductToCart = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const productId = parseInt(ctx.params.id);
    const quantity = (ctx.request.body as { quantity: number }).quantity ?? 1;

    const product = await findProduct(productId);

    if (!product) throw new AppError("product not found.");

    if (product.quantity <= 0)
      throw new AppError("Product is out of stock", 400);
    if (product.quantity < quantity)
      throw new AppError("Insufficient products in stock.");

    const result = await findAndAddProductToCart({
      email,
      productId,
      quantityToAdd: quantity,
    });
    if (!result) throw new AppError("Could not add product to cart");

    ctx.body = generateResponseBody({
      success: true,
      message: "Item added to cart",
      data: result,
    });
  } catch (e: Error | AppError | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError ? e.message : "Could not add product to cart.",
    });
    throw e;
  }
};

const removeProductFromCart = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const productId = parseInt(ctx.params.id);
    const result = await findAndRemoveProductFromCart(email, productId);
    if (!result) throw new AppError("Could not remove product from cart");

    ctx.body = generateResponseBody({
      success: true,
      message: "Product removed from cart",
      data: result,
    });
  } catch (e: Error | AppError | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError
          ? e.message
          : "Could not remove product from cart.",
    });
    throw e;
  }
};

export {
  addProductToCart,
  checkCartProductInStock,
  getAllCart,
  getCart,
  removeProductFromCart,
};
