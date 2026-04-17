import { Role } from "@/generated/prisma/enums.js";
import { validateRole } from "@/middleware/validate.js";
import { CustomContext } from "@/types/index.js";
import "dotenv/config";
import { Context } from "koa";
import jwt from "koa-jwt";
import Router from "koa-router";
import adminRouter from "./adminRoute.js";
import { privateUserRouter } from "./privateUserRoute.js";
import sellerRouter from "./sellerRoute.js";

const privateRouter = new Router<any, Context & CustomContext>();

privateRouter.use(
  jwt({
    secret: process.env.SECRET_KEY ?? "some-secret-key",
    getToken: (ctx) => {
      const auth = ctx.headers.authorization;
      if (auth && auth.startsWith("Bearer ")) {
        return auth.slice(7);
      }

      const queryToken = ctx.query.token;
      return typeof queryToken === "string" ? queryToken : null;
    },
  }),
);

//Logged in User
privateRouter.use(privateUserRouter.routes());

//Seller Router
privateRouter.use(validateRole(Role.SELLER), sellerRouter.routes());

// Admin Router
privateRouter.use(validateRole(Role.ADMIN), adminRouter.routes());

export default privateRouter;
