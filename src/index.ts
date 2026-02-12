import cors from "@koa/cors";
import Koa from "koa";
import parser from "koa-bodyparser";
import router from "./routes/index.js";

const app = new Koa();

app.use(cors());
app.use(parser());

app.use(router.routes());

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(3000);
