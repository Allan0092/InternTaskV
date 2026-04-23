import { getAllCart } from "@/controller/cartController.js";
import { getAllOrders, updateOrder } from "@/controller/orderController.js";
import { getAllPayments } from "@/controller/paymentController.js";
import {
  adminDeleteProduct,
  getAllProducts,
  updateProduct,
} from "@/controller/productController.js";
import {
  deleteUser,
  editUser,
  enableUserAccount,
  getUsers,
} from "@/controller/userController.js";
import "dotenv";
import { Context } from "koa";
import Router from "koa-router";

const adminRouter = new Router<any, Context>({ prefix: "/admin" });

// Users
adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id/enable", enableUserAccount);
adminRouter.patch("/users/:id", editUser);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.delete("/users/:id/deactivate", editUser);

// Products
adminRouter.get("/products", getAllProducts);
adminRouter.patch("/products/:id", updateProduct);
adminRouter.delete("/products/:id", adminDeleteProduct);

// Cart
adminRouter.get("/carts", getAllCart);

// Orders
adminRouter.get("/orders", getAllOrders);
adminRouter.patch("/orders/:id", updateOrder);

// Payments
adminRouter.get("/payments", getAllPayments);

export default adminRouter;
