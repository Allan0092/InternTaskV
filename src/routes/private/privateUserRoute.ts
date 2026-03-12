import { getCart } from "@/controller/cartController.js";
import { softDeleteUser } from "@/controller/userController.js";
import { Context } from "koa";
import Router from "koa-router";

const privateUserRouter = new Router<any, Context>({ prefix: "/users" });

// User Account
privateUserRouter.delete("/account", softDeleteUser);

// Cart
privateUserRouter.get("/cart", getCart);

export { privateUserRouter };
