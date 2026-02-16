import cors from "@koa/cors";
import "dotenv";
import Koa from "koa";
import parser from "koa-bodyparser";
import router from "./routes/index.js";
import { logger, loggerMiddleware } from "./utils/logger.js";

const app = new Koa();

app.context.logger = logger;

app.use(loggerMiddleware);
app.use(cors());
app.use(parser());

app.use(router.routes());

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(process.env.SERVER_PORT);

console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
