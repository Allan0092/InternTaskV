import {
  getAllProductsWithSeller,
  getProductByCategory,
  getProductBySeller,
  getProductsByPage,
} from "@/controller/productController.js";
import { login, registerUser } from "@/controller/userController.js";
import { validateBody } from "@/middleware/validate.js";
import loginSchema from "@/validation/loginValidation.js";
import registerSchema from "@/validation/registerValidation.js";
import Router from "koa-router";

const publicRouter = new Router({ prefix: "/public" });

// User
publicRouter.post("/login", validateBody(loginSchema), login);
publicRouter.post("/register", validateBody(registerSchema), registerUser);

// Product
publicRouter.get("/products", getAllProductsWithSeller);
publicRouter.post("/products", getProductBySeller);
publicRouter.get("/products/:page", getProductsByPage);
publicRouter.get("/products/category/:category", getProductByCategory);

export default publicRouter;
