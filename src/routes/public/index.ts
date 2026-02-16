import { login, registerUser } from "@/controller/userController.js";
import { validateBody } from "@/middleware/validate.js";
import loginSchema from "@/validation/loginValidation.js";
import registerSchema from "@/validation/registerValidation.js";
import Router from "koa-router";

const publicRouter = new Router({ prefix: "/public" });

publicRouter.post("/login", validateBody(loginSchema), login);
publicRouter.post("/register", validateBody(registerSchema), registerUser);

export default publicRouter;
