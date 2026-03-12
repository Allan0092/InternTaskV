import { getCart } from "@/controller/cartController.js";
import { Context } from "koa";
import Router from "koa-router";

const privateUserRouter = new Router<any, Context>({ prefix: "/users" });

privateUserRouter.get("/cart", getCart);

export { privateUserRouter };
