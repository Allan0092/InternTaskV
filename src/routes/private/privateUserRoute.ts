import {
  addProductToCart,
  checkCartProductInStock,
  getCart,
  removeProductFromCart,
} from "@/controller/cartController.js";
import {
  cancelOrder,
  getOrders,
  placeOrder,
  testOrderItems,
} from "@/controller/orderController.js";
import {
  checkKhaltiPaymentStatus,
  getKhaltiUrl,
} from "@/controller/paymentController.js";
import { streamNotifications } from "@/controller/socketController.js";
import {
  changePassword,
  editUserByEmail,
  softDeleteUser,
} from "@/controller/userController.js";
import { validateBody, validateBuyerAndOrder } from "@/middleware/validate.js";
import {
  changePasswordValidation,
  updateUserSchema,
} from "@/validation/updateUserValidation.js";
import { Context } from "koa";
import Router from "koa-router";

const privateUserRouter = new Router<any, Context>();

// User Account
privateUserRouter.delete("/users/account", softDeleteUser);
privateUserRouter.get("/users/details"); //TODO For getting user's account details
privateUserRouter.patch(
  "/users",
  validateBody(updateUserSchema),
  editUserByEmail,
);
privateUserRouter.patch(
  "/users/change-password",
  validateBody(changePasswordValidation),
  changePassword,
);

// Cart
privateUserRouter.get("/users/carts", getCart);
privateUserRouter.patch("/users/carts/:id", addProductToCart);
privateUserRouter.delete("/users/carts/:id", removeProductFromCart);

// Order
privateUserRouter.get("/users/orders", getOrders);
privateUserRouter.post("/users/orders", checkCartProductInStock, placeOrder);

privateUserRouter.delete(
  "/users/orders/:id",
  validateBuyerAndOrder,
  cancelOrder,
);

// Payment
privateUserRouter.get("/payment", getKhaltiUrl);
privateUserRouter.get("/payment/check", checkKhaltiPaymentStatus);

// Notifications
privateUserRouter.get("/notifications/stream", streamNotifications);

//Email
privateUserRouter.get("/test", testOrderItems);

export { privateUserRouter };
