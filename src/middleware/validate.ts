import { OrderItemStatus, Role } from "@/generated/prisma/enums.js";
import {
  findOrderByOrderItemId,
  findOrdersByEmail,
  findOrderSellers,
} from "@/service/Order.js";
import { findOrderItem } from "@/service/OrderItem.js";
import { findProductSeller } from "@/service/Product.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { Context, Next } from "koa";
import * as yup from "yup";

const validateQueryParams = <T extends yup.AnyObject>(
  schema: yup.ObjectSchema<T>,
) => {
  return async (ctx: Context, next: Next) => {
    try {
      const validated = await schema.validate(ctx.query, {
        abortEarly: false,
        stripUnknown: true,
        strict: false,
      });

      ctx.request.body = validated;

      await next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        ctx.status = 400;
        ctx.body = generateResponseBody({
          message: err.message ?? "Validation failed",
        });
        return;
      }

      throw err;
    }
  };
};

const validateBody = <T extends yup.AnyObject>(schema: yup.ObjectSchema<T>) => {
  return async (ctx: Context, next: Next) => {
    try {
      const validated = await schema.validate(ctx.request.body, {
        abortEarly: false,
        stripUnknown: true,
        strict: false,
      });

      ctx.request.body = validated;

      await next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        ctx.status = 400;
        ctx.body = {
          message: "Validation failed",
        };
        return;
      }

      throw err;
    }
  };
};

const validateRole = (role: Role) => {
  return async (ctx: Context, next: Next) => {
    try {
      const { role: givenRole } = ctx.state.user;
      if (givenRole === Role.ADMIN) {
        await next();
      } else if (role === givenRole) {
        await next();
      } else {
        throw new AppError("Role not authorized", 401);
      }
    } catch (e: Error | AppError | any) {
      if (ctx.body && ctx.status) return;
      ctx.response.status = e.status ?? 400;
      ctx.body = generateResponseBody({
        message: e instanceof AppError ? e.message : "You are not authorised.",
      });
    }
  };
};

const validateUserAndProduct = async (ctx: Context, next: Next) => {
  try {
    const productId = parseInt(ctx.params.id ?? ctx.query.id);
    const user = await findProductSeller(productId);
    if (!user) throw new AppError("Product not found.", 404);

    const { email: givenEmail } = ctx.state.user;
    if (ctx.state.user.role === Role.ADMIN) {
      await next();
    } else if (user.email === givenEmail) {
      await next();
    } else {
      throw new AppError("User not authorized for this action", 401);
    }
  } catch (e: Error | AppError | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "You are not authorised.",
    });
  }
};

const validateSellerAndOrderItem = async (ctx: Context, next: Next) => {
  try {
    const { orderItemId, status } = ctx.request.body as {
      orderItemId: number;
      status: OrderItemStatus;
    };

    const order = await findOrderByOrderItemId(orderItemId);
    if (!order) throw new AppError("Could not find order");

    if (!order.paymentId) throw new AppError("Payment has not been made");

    ctx.state.order = order;

    const orderItem = await findOrderItem(orderItemId);
    if (!orderItem) throw new AppError("Could not find order item");

    const user = await findProductSeller(orderItem.productId);
    if (!user) throw new AppError("Product not found.", 404);

    const { email: givenEmail } = ctx.state.user;
    if (ctx.state.user.role === Role.ADMIN) {
      await next();
    } else if (user.email === givenEmail && user.role === Role.SELLER) {
      // TODO Check orderItem lifecycle

      await next();
    } else {
      throw new AppError("Not authorised for this Order", 401);
    }
  } catch (e: Error | AppError | any) {
    ctx.response.status = e.status ?? 401;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "You are not authorised.",
    });
  }
};

const validateSellerAndOrder = async (ctx: Context, next: Next) => {
  try {
    const orderId = parseInt(ctx.params.id ?? ctx.query.id);
    const users = await findOrderSellers(orderId);

    if (!users) throw new AppError("Seller not found.", 404);

    const { email: givenEmail } = ctx.state.user;

    if (ctx.state.user.role === Role.ADMIN) {
      await next();
    } else if (ctx.state.user.role !== Role.SELLER) {
      throw new AppError("User is not registered as a seller.");
    } else if (
      users
        .map((user) => {
          return user.email === givenEmail;
        })
        .indexOf(true) !== -1
    ) {
      await next();
    } else {
      throw new Error();
    }
  } catch (e: Error | AppError | any) {
    ctx.response.status = e.status ?? 401;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Seller not authorised.",
    });
  }
};

const validateBuyerAndOrder = async (ctx: Context, next: Next) => {
  try {
    const orderId = parseInt(ctx.params.id ?? ctx.query.id);
    const email = ctx.state.user.email;

    if (ctx.state.user.role === Role.ADMIN) {
      await next();
      return;
    }

    const orders = await findOrdersByEmail(email, 1, 1000);

    if (!orders || orders.length === 0) {
      throw new AppError("No orders found for this user.", 404);
    }

    const orderExists = orders.some((order) => order.id === orderId);

    if (orderExists) {
      await next();
    } else {
      throw new AppError("Order does not belong to this user.", 401);
    }
  } catch (e: Error | AppError | any) {
    ctx.response.status = e.status ?? 401;
    ctx.body = generateResponseBody({
      message:
        e instanceof AppError
          ? e.message
          : "Buyer not authorized for this order.",
    });
  }
};

export {
  validateBody,
  validateBuyerAndOrder,
  validateQueryParams,
  validateRole,
  validateSellerAndOrder,
  validateSellerAndOrderItem,
  validateUserAndProduct,
};
