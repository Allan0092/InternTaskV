import { getUsers } from "@/controller/userController.js";
import "dotenv";
import Router from "koa-router";

const adminRouter = new Router({ prefix: "/admin" });

// Users
adminRouter.get("/users", getUsers);
adminRouter.delete("/users/:id");

// Products
adminRouter.get("/products");
adminRouter.delete("/products/:id");

export default adminRouter;
