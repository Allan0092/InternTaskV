import {
  getAllProductsWithSeller,
  getProductBySeller,
  getProductImage,
} from "@/controller/productController.js";
import { login, registerUser } from "@/controller/userController.js";
import { validateBody, validateQueryParams } from "@/middleware/validate.js";
import loginSchema from "@/validation/loginValidation.js";
import { priceRangeSchema } from "@/validation/priceRangeValidation.js";
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
publicRouter.get(
  "/:id/products",
  validateQueryParams(pageAndLimitSchema),
  validateQueryParams(priceRangeSchema),
  getProductBySeller,
);
publicRouter.get("/image", getProductImage);

export default publicRouter;
