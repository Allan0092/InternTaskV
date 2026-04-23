import { addClient, removeClient } from "@/service/Notification.js";
import { Context } from "koa";

const streamNotifications = async (ctx: Context) => {
  const email = ctx.state.user.email as string;

  const response = ctx.res;

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  addClient(email, response);

  response.write(
    `event: connected\ndata: ${JSON.stringify({
      message: "SSE stream connected",
      timestamp: new Date().toISOString(),
    })}\n\n`,
  );

  const keepAliveInterval = setInterval(() => {
    if (!response.writableEnded && !response.destroyed) {
      response.write(`: ping ${Date.now()}\n\n`);
    }
  }, 20000);

  ctx.req.on("close", () => {
    clearInterval(keepAliveInterval);
    removeClient(email, response);
  });

  ctx.respond = false;
};

export { streamNotifications };
