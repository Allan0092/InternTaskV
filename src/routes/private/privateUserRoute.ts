import {
  addProductToCart,
  getCart,
  removeProductFromCart,
} from "@/controller/cartController.js";
import { getOrders } from "@/controller/orderController.js";
import { softDeleteUser } from "@/controller/userController.js";
import { Context } from "koa";
import Router from "koa-router";

const privateUserRouter = new Router<any, Context>({ prefix: "/users" });

// User Account
privateUserRouter.delete("/account", softDeleteUser);

// Cart
privateUserRouter.get("/carts", getCart);
privateUserRouter.patch("/carts/:id", addProductToCart);
privateUserRouter.delete("/carts/:id", removeProductFromCart);

// Order
privateUserRouter.get("/orders", getOrders);

export { privateUserRouter };
