import { addProduct } from "@/controller/productController.js";
import { validateBody } from "@/middleware/validate.js";
import { productSchema } from "@/validation/productValidation.js";
import Router from "koa-router";

const sellerRouter = new Router({ prefix: "/seller" });

sellerRouter.post("/", validateBody(productSchema), addProduct);

export default sellerRouter;
