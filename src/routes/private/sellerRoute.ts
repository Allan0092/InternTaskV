import {
  addProduct,
  softDeleteProduct,
  updateProduct,
} from "@/controller/productController.js";
import { validateBody, validateUser } from "@/middleware/validate.js";
import {
  addProductSchema,
  updateProductSchema,
} from "@/validation/productValidation.js";
import Router from "koa-router";

const sellerRouter = new Router({ prefix: "/product" });

sellerRouter.post("/", validateBody(addProductSchema), addProduct);
sellerRouter.put(
  "/:id",
  validateBody(updateProductSchema),
  validateUser,
  updateProduct,
);
sellerRouter.delete("/:id", validateUser, softDeleteProduct);

export default sellerRouter;
