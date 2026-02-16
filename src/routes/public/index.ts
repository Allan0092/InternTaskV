import { login } from "@/controller/userController.js";
import { validateBody } from "@/middleware/validate.js";
import loginSchema from "@/validation/loginValidation.js";
import Router from "koa-router";

const publicRouter = new Router({ prefix: "/public" });

publicRouter.post("/login", validateBody(loginSchema), login);

export default publicRouter;
