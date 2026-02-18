import cors from "@koa/cors";
import "dotenv";
import Koa from "koa";
import parser from "koa-bodyparser";
import router from "./routes/index.js";
import { logger, loggerMiddleware } from "./utils/logger.js";
import { config } from "./validation/dotEnvValidation.js";

const app = new Koa();

app.context.logger = logger;

app.use(loggerMiddleware);
app.use(cors());
app.use(parser());

app.use(router.routes());

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(config.server_port, () => {
  console.log(`Server running on port ${config.server_port}`);
});
