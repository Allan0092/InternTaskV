import { getAllCart } from "@/controller/cartController.js";
import {
  adminDeleteProduct,
  getAllProducts,
} from "@/controller/productController.js";
import { deleteUser, getUsers } from "@/controller/userController.js";
import "dotenv";
import { Context } from "koa";
import Router from "koa-router";

const adminRouter = new Router<any, Context>({ prefix: "/admin" });

// Users
adminRouter.get("/users", getUsers);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.get("/users/cart", getAllCart);

// Products
adminRouter.get("/products", getAllProducts);
adminRouter.delete("/products/:id", adminDeleteProduct);

export default adminRouter;
