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

const orderItemStatusLifecycleOrThrow = (
  currStatus: OrderItemStatus,
  newStatus: OrderItemStatus,
) => {
  if (currStatus === newStatus) {
    throw new AppError(`Order Item status already set to ${currStatus}`);
  }
  // Final Status
  switch (currStatus) {
    case OrderItemStatus.SHIPPED:
      throw new AppError("Cannot change order item status from Shipped", 401, {
        status: currStatus,
      });
    case OrderItemStatus.DECLINE:
      throw new AppError("Cannot change order item status from Declined", 401, {
        status: currStatus,
      });
    case OrderItemStatus.COMPLETED:
      throw new AppError("Order has already been Completed", 401, {
        status: currStatus,
      });
  }

  if (currStatus === OrderItemStatus.PENDING) {
    if (newStatus === OrderItemStatus.PROCESSING) {
      return;
    } else if (newStatus === OrderItemStatus.DECLINE) {
      return;
    }
  }
  if (currStatus === OrderItemStatus.PROCESSING) {
    if (newStatus === OrderItemStatus.SHIPPED) {
      return;
    }
  }
  throw new AppError("Could not change the status", 401, {
    status: currStatus,
  });
};

export { orderItemStatusLifecycleOrThrow, orderStatusLifeCycle };
