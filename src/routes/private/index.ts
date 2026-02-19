import { validateRole } from "@/middleware/validate.js";
import "dotenv/config";
import { Context } from "koa";
import jwt from "koa-jwt";
import Router from "koa-router";
import adminRouter from "./adminRoute.js";
import sellerRouter from "./sellerRoute.js";

const privateRouter = new Router<any, Context>();

privateRouter.use(jwt({ secret: process.env.SECRET_KEY ?? "some-secret-key" }));

//Seller Router
privateRouter.use(validateRole("SELLER"), sellerRouter.routes());

// Admin Router
privateRouter.use(validateRole("ADMIN"), adminRouter.routes());

export default privateRouter;
