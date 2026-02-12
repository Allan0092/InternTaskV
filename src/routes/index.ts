import Router from "koa-router";
import privateRouter from "./private/index.js";
import publicRouter from "./public/index.js";

const router = new Router({ prefix: "/api" });

router.get("/health", (ctx) => {
  ctx.body("health check");
});

router.use(publicRouter.routes());
router.use(privateRouter.routes());

export default router;
