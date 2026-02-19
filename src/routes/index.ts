import { CustomContext } from "@/types/index.js";
import { Context } from "koa";
import Router from "koa-router";
import privateRouter from "./private/index.js";
import publicRouter from "./public/index.js";

const router = new Router<any, Context & CustomContext>({ prefix: "/api" });

router.get("/health", (ctx) => {
  ctx.body("health check");
});

router.use(publicRouter.routes());
router.use(privateRouter.routes());

export default router;
