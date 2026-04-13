import { OrderItemStatus } from "@/generated/prisma/enums.js";
import { findAndUpdateOrderItem, findOrderItem } from "@/service/OrderItem.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { Context } from "koa";

const updateOrderItemStatus = async (ctx: Context) => {
  try {
    const orderItemId = parseInt(ctx.params.id);
    const { status } = ctx.request.body as { status: OrderItemStatus };
    if (!status) throw new AppError("");

    const orderItem = await findOrderItem(orderItemId);
    if (!orderItem) throw new AppError("Could not find order item", 404);

    switch (orderItem.status) {
      case OrderItemStatus.SHIPPED:
        throw new AppError("Cannot change order item status from Shipped");
      case OrderItemStatus.DECLINE:
        throw new AppError("Cannot change order item status from Declined");
      case OrderItemStatus.COMPLETED:
        throw new AppError("Order has already been Completed");
    }

    if (orderItem.status === OrderItemStatus.PENDING) {
    }

    const result = await findAndUpdateOrderItem(orderItemId, {
      status: status,
    });

    ctx.body = generateResponseBody({
      success: true,
      message: "Order Item status updated successfully",
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError ? e.message : "Could not update order status.",
    });
    throw e;
  }
};

export { updateOrderItemStatus };
