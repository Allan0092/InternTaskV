import { findProductSeller } from "@/model/Product.js";
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
          message: "Validation failed",
          error: err.message,
        });
        return;
      }

      // Let global error handler catch real crashes
      throw err;
    }
  };
};

const validateBody = <T extends yup.AnyObject>(schema: yup.ObjectSchema<T>) => {
  return async (ctx: Context, next: Next) => {
    try {
      const validated = await schema.validate(ctx.request.body, {
        abortEarly: false, // collect ALL errors, not just first
        stripUnknown: true, // remove unknown fields
        strict: false, // allow coercion (recommended)
      });

      // Put validated (and cleaned) data back → safer than raw body
      ctx.request.body = validated;

      await next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        ctx.status = 400;
        ctx.body = {
          error: "Validation failed",
          details: err.errors, // array of messages
          // or more detailed: err.inner.map(e => ({ path: e.path, message: e.message }))
        };
        return;
      }

      // Let global error handler catch real crashes
      throw err;
    }
  };
};

const validateRole = (role: string) => {
  return async (ctx: Context, next: Next) => {
    try {
      const { role: givenRole } = ctx.state.user;
      if (givenRole === "ADMIN") {
        await next();
      } else if (role === givenRole) {
        await next();
      } else {
        throw new AppError("Role not authorized", 401);
      }
    } catch (e: Error | AppError | any) {
      ctx.response.status = e.status ?? 400;
      ctx.body = generateResponseBody({
        message: e instanceof AppError ? e.message : "You are not authorised.",
      });
    }
  };
};

const validateUser = async (ctx: Context, next: Next) => {
  try {
    const productId = parseInt(ctx.params.id);
    const user = await findProductSeller(productId);
    if (!user) throw new AppError("Seller of product not found.");

    const { email: givenEmail } = ctx.state.user;
    if (ctx.state.user.role === "ADMIN") {
      await next();
    } else if (user.email === givenEmail) {
      await next();
    } else {
      throw new AppError("User not authorized for this action", 401);
    }
  } catch (e: Error | AppError | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "You are not authorised.",
    });
  }
};

export { validateBody, validateQueryParams, validateRole, validateUser };
