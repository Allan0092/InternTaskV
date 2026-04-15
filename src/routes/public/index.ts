import { paymentTest } from "@/controller/paymentController.js";
import {
  getAllProductsWithSeller,
  getProductBySeller,
  getProductImage,
} from "@/controller/productController.js";
import { login, registerUser } from "@/controller/userController.js";
import { validateBody, validateQueryParams } from "@/middleware/validate.js";
import loginSchema from "@/validation/loginValidation.js";
import {
  pageAndLimitSchema,
  productCategorySchema,
} from "@/validation/productValidation.js";
import registerSchema from "@/validation/registerValidation.js";
import { Context } from "koa";
import Router from "koa-router";

const publicRouter = new Router<any, Context>({ prefix: "/public" });

// User
publicRouter.post("/login", validateBody(loginSchema), login);
publicRouter.post("/register", validateBody(registerSchema), registerUser);

// Product
publicRouter.get(
  "/products",
  validateQueryParams(pageAndLimitSchema),
  validateQueryParams(productCategorySchema),
  getAllProductsWithSeller,
);

// Get products sold by seller id
publicRouter.get(
  "/users/:id/products",
  validateQueryParams(pageAndLimitSchema),
  getProductBySeller,
);

// Get product image by providing image file name
publicRouter.get("/image", getProductImage);
publicRouter.get("/payment", paymentTest);

// publicRouter.get("/test-status/:id", checkAndUpdateOrderStatusWithSellerUpdate);

export default publicRouter;
