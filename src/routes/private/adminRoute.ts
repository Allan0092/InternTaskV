import { getAllCart } from "@/controller/cartController.js";
import { getAllOrders } from "@/controller/orderController.js";
import {
  adminDeleteProduct,
  getAllProducts,
} from "@/controller/productController.js";
import {
  deleteUser,
  editUser,
  enableUserAccount,
  getUsers,
} from "@/controller/userController.js";
import { validateBody } from "@/middleware/validate.js";
import { updateUserSchema } from "@/validation/updateUserValidation.js";
import "dotenv";
import { Context } from "koa";
import Router from "koa-router";

const adminRouter = new Router<any, Context>({ prefix: "/admin" });

// Users
adminRouter.get("/users", getUsers);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.patch("/users/:id", enableUserAccount);
adminRouter.patch("/users", validateBody(updateUserSchema), editUser);

// Products
adminRouter.get("/products", getAllProducts);
adminRouter.delete("/products/:id", adminDeleteProduct);

// Cart
adminRouter.get("/carts", getAllCart);

// Orders
adminRouter.get("/orders", getAllOrders);

export default adminRouter;
