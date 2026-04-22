import cors from "@koa/cors";
import "dotenv/config";
import Koa from "koa";
import parser from "koa-bodyparser";
import serve from "koa-static";
import path from "node:path";
import router from "./routes/index.js";
import { generateResponseBody } from "./utils/index.js";
import { logger, loggerMiddleware } from "./utils/logger.js";
import { config } from "./validation/dotEnvValidation.js";

const app = new Koa();

app.context.logger = logger;

app.use(loggerMiddleware);
app.use(cors());
app.use(parser());

// TODO Socket

app.use(serve(path.join(process.cwd(), "public")));

app.use(router.routes());

app.use((ctx) => {
  ctx.status = 404;
  ctx.body = generateResponseBody({
    success: false,
    message: "This URL does not exist. Please check your request.",
  });
});

app.listen(config.server_port, () => {
  console.log(`Server running on port ${config.server_port}`);
});
