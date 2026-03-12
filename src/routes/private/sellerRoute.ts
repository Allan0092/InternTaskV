import {
  addProduct,
  softDeleteProduct,
  updateProduct,
  uploadProductImages,
} from "@/controller/productController.js";
import { validateBody, validateUserAndProduct } from "@/middleware/validate.js";
import { CustomContext } from "@/types/index.js";
import { uploadPhoto } from "@/utils/index.js";
import {
  addProductSchema,
  updateProductSchema,
} from "@/validation/productValidation.js";
import { Context } from "koa";
import Router from "koa-router";

const sellerRouter = new Router<any, Context & CustomContext>({
  prefix: "/products",
});

sellerRouter.post("/", validateBody(addProductSchema), addProduct);

// Update product details
sellerRouter.put(
  "/:id",
  validateBody(updateProductSchema),
  validateUserAndProduct,
  updateProduct,
);

// Upload Photos
sellerRouter.put(
  "/:id/upload-images",
  validateUserAndProduct,
  uploadPhoto.fields([{ name: "photo", maxCount: 12 }]),
  uploadProductImages,
);

sellerRouter.delete("/:id", validateUserAndProduct, softDeleteProduct);

export default sellerRouter;
