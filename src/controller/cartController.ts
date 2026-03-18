import { findAllCart, findCart } from "@/model/Cart.js";
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

export { getAllCart, getCart };
