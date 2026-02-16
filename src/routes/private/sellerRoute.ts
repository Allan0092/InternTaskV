import Router from "koa-router";

const sellerRouter = new Router({ prefix: "/seller" });

sellerRouter.post("/");

export default sellerRouter;
