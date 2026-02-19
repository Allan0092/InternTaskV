import {
  getAllProductsWithSeller,
  getProductByCategory,
  getProductBySeller,
  getProductsByRange,
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
import Router from "koa-router";

const publicRouter = new Router({ prefix: "/public" });

// User
publicRouter.post("/login", validateBody(loginSchema), login);
publicRouter.post("/register", validateBody(registerSchema), registerUser);

// Product
publicRouter.get(
  "/products",
  validateQueryParams(pageAndLimitSchema),
  getAllProductsWithSeller,
);
publicRouter.get(
  "/:id/products",
  validateQueryParams(pageAndLimitSchema),
  getProductBySeller,
);
publicRouter.get(
  "/products/category",
  validateQueryParams(pageAndLimitSchema),
  validateQueryParams(productCategorySchema),
  getProductByCategory,
);
publicRouter.get(
  "/products/search/price",
  validateQueryParams(priceRangeSchema),
  getProductsByRange,
);

export default publicRouter;
