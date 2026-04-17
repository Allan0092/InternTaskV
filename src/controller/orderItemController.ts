import { OrderItemStatus } from "@/generated/prisma/enums.js";
import { notifyUser } from "@/service/Notification.js";
import { findOrderById } from "@/service/Order.js";
import { findAndUpdateOrderItem, findOrderItem } from "@/service/OrderItem.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { orderItemStatusLifecycleOrThrow } from "@/utils/lifecycle.js";
import { Context, Next } from "koa";

const updateOrderItemStatus = async (ctx: Context, next: Next) => {
  try {
    const { orderItemId, status } = ctx.request.body as {
      status: OrderItemStatus;
      orderItemId: number;
    };
    // const orderItemId = parseInt(ctx.request.body.productId as {productId: string});

    const orderItem = await findOrderItem(orderItemId);
    if (!orderItem) throw new AppError("Could not find order item", 404);

    orderItemStatusLifecycleOrThrow(orderItem.status, status);

    const result = await findAndUpdateOrderItem(orderItemId, {
      status: status,
    });

    if (!result)
      throw new AppError("Could not update orderItem status at this time.");

    ctx.body = generateResponseBody({
      success: true,
      message: "Order Item status updated successfully",
      data: { status },
    });

    const order = await findOrderById(orderItem.orderId);
    if (order) {
      notifyUser(order.user.email, {
        type: "ORDER_ITEM_STATUS_UPDATED",
        message: `An item in your order #${order.id} changed to ${status}.`,
        data: {
          orderId: order.id,
          orderItemId,
          orderItemStatus: status,
        },
      });
    }

    await next();
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError ? e.message : "Could not update order status.",
      data: e instanceof AppError ? e.data : {},
    });
    throw e;
  }
};

export { updateOrderItemStatus };
