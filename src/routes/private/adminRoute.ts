import Router from "koa-router";

const adminRouter = new Router({ prefix: "/admin" });

// Users
adminRouter.get("/admin/users");
adminRouter.delete("/admin/users/:id");

// Products
adminRouter.get("/admin/products");
adminRouter.delete("/admin/products/:id");

export default adminRouter;
