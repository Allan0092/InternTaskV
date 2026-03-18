import { findAllOrders, findOrdersByEmail } from "@/model/Order.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { Context } from "koa";

const getAllOrders = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const min = Number(ctx.query.min ?? 0);
    const max = Number(ctx.query.max ?? 999999999);
    const orders = await findAllOrders(page, limit, min, max);
    if (!orders) throw new AppError("No orders found");

    ctx.body = generateResponseBody({
      success: true,
      message: "All Orders fetched successfully.",
      data: orders,
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not fetch orders.",
    });
  }
};

const getOrders = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const min = Number(ctx.query.min ?? 0);
    const max = Number(ctx.query.max ?? 999999999);
    const orders = await findOrdersByEmail(email, page, limit, min, max);

    ctx.body = generateResponseBody({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not fetch orders.",
    });
  }
};

export { getAllOrders, getOrders };
