import { OrderItemStatus, OrderStatus } from "@/generated/prisma/enums.js";
import { AppError } from "@/types/index.js";

const orderStatusLifeCycle = (
  currStatus: OrderStatus,
  newStatus: OrderStatus,
) => {
  // PENDING -> PROCESSING -> SHIPPING -> COMPLETED
  // PENDING -> PROCESSING -> DECLINED
  // PENDING -> DECLINED

  if (newStatus === OrderStatus.PENDING) {
    return false;
  }

  if (currStatus === OrderStatus.PENDING) {
    if (newStatus === OrderStatus.PROCESSING) {
      return true;
    } else if (newStatus === OrderStatus.DECLINED) {
      return true;
    }
  }

  if (currStatus === OrderStatus.PROCESSING) {
    if (newStatus === OrderStatus.DECLINED) {
      return true;
    } else if (newStatus === OrderStatus.SHIPPING) {
      return true;
    }
  }

  if (
    currStatus === OrderStatus.SHIPPING &&
    newStatus === OrderStatus.COMPLETED
  ) {
    return true;
  }

  return false;
};

const orderItemStatusLifecycle = (
  currStatus: OrderItemStatus,
  newStatus: OrderItemStatus,
) => {
  // Final Status
  switch (currStatus) {
    case OrderItemStatus.SHIPPED:
      throw new AppError("Cannot change order item status from Shipped", 401);
    case OrderItemStatus.DECLINE:
      throw new AppError("Cannot change order item status from Declined", 401);
    case OrderItemStatus.COMPLETED:
      throw new AppError("Order has already been Completed", 401);
  }

  if (currStatus === OrderItemStatus.PENDING) {
    if (newStatus === OrderItemStatus.PROCESSING) {
      return true;
    } else if (newStatus === OrderItemStatus.DECLINE) {
      return true;
    }
  }
  if (currStatus === OrderItemStatus.PROCESSING) {
    if (newStatus === OrderItemStatus.SHIPPED) {
      return true;
    }
  }
  throw new AppError("Could not change the status", 401);
};

export { orderItemStatusLifecycle, orderStatusLifeCycle };
