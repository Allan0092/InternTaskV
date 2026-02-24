import {
  addProduct,
  softDeleteProduct,
  updateProduct,
  uploadProductImages,
} from "@/controller/productController.js";
import { validateBody, validateUser } from "@/middleware/validate.js";
import { CustomContext } from "@/types/index.js";
import { uploadPhoto } from "@/utils/index.js";
import {
  addProductSchema,
  updateProductSchema,
} from "@/validation/productValidation.js";
import { Context } from "koa";
import Router from "koa-router";

const sellerRouter = new Router<any, Context & CustomContext>({
  prefix: "/product",
});

sellerRouter.post("/", validateBody(addProductSchema), addProduct);

// Update product details
sellerRouter.put(
  "/:id",
  validateBody(updateProductSchema),
  validateUser,
  updateProduct,
);

// Upload Photos
sellerRouter.post(
  "/upload-files",
  validateUser,
  uploadPhoto.fields([{ name: "photo", maxCount: 12 }]),
  uploadProductImages,
);
sellerRouter.delete("/:id", validateUser, softDeleteProduct);

export default sellerRouter;
