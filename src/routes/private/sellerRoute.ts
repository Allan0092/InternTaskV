import {
  addProduct,
  softDeleteProduct,
  updateProduct,
} from "@/controller/productController.js";
import { validateBody } from "@/middleware/validate.js";
import {
  addProductSchema,
  updateProductSchema,
} from "@/validation/productValidation.js";
import Router from "koa-router";

const sellerRouter = new Router({ prefix: "/product" });

sellerRouter.post("/", validateBody(addProductSchema), addProduct);
sellerRouter.put("/:id", validateBody(updateProductSchema), updateProduct);
sellerRouter.delete("/:id", softDeleteProduct);

export default sellerRouter;
