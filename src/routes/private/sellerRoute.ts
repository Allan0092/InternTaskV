import {
  checkAndUpdateOrderStatusWithSellerUpdate,
  getOrdersForSeller,
} from "@/controller/orderController.js";
import { updateOrderItemStatus } from "@/controller/orderItemController.js";
import {
  addProduct,
  getAllSellerProducts,
  softDeleteProduct,
  updateProduct,
  uploadProductImages,
} from "@/controller/productController.js";
import {
  validateBody,
  validateSellerAndOrderItem,
  validateUserAndProduct,
} from "@/middleware/validate.js";
import { CustomContext } from "@/types/index.js";
import { uploadPhoto } from "@/utils/index.js";
import { sellerUpdateOrderItemSchema } from "@/validation/orderItemValidation.js";
import {
  addProductSchema,
  updateProductSchema,
} from "@/validation/productValidation.js";
import { Context } from "koa";
import Router from "koa-router";

const sellerRouter = new Router<any, Context & CustomContext>({
  prefix: "",
});

sellerRouter.post("/products/", validateBody(addProductSchema), addProduct);

// Get Seller's product
sellerRouter.get("/products/", getAllSellerProducts);

// Update product details
sellerRouter.patch(
  "/products/:id",
  validateBody(updateProductSchema),
  validateUserAndProduct,
  updateProduct,
);

// Upload Photos
sellerRouter.put(
  "/products/:id/upload-images",
  validateUserAndProduct,
  uploadPhoto.fields([{ name: "photo", maxCount: 12 }]),
  uploadProductImages,
);

sellerRouter.delete("/products/:id", validateUserAndProduct, softDeleteProduct);

// Orders
sellerRouter.get("/orders", getOrdersForSeller);
// sellerRouter.patch(
//   "/orders/:id",
//   validateBody(sellerUpdateOrderSchema),
//   validateSellerAndOrder,
//   updateOrderStatus,
// );

sellerRouter.patch(
  "/orders/update",
  validateBody(sellerUpdateOrderItemSchema),
  validateSellerAndOrderItem,
  updateOrderItemStatus,
  checkAndUpdateOrderStatusWithSellerUpdate,
);

export default sellerRouter;
