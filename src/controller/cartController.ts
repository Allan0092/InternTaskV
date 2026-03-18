import {
  findAllCart,
  findAndAddProductToCart,
  findCart,
} from "@/model/Cart.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { Context } from "koa";

const getCart = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const cart = await findCart(email);
    if (!cart) throw new AppError("Cart is empty", 404);
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

// Admin User
const getAllCart = async (ctx: Context) => {
  try {
    const cart = await findAllCart();
    if (!cart) throw new AppError("Could not get cart");
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

const addProductToCart = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const productId = parseInt(ctx.params.id);
    const quantity = (ctx.request.body as { quantity: number }).quantity ?? 1;
    const result = await findAndAddProductToCart(email, productId, quantity);
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

export { addProductToCart, getAllCart, getCart };
