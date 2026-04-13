import { OrderStatus } from "@/generated/prisma/enums.js";

const orderStatusLifeCycle = (curr: OrderStatus, next: OrderStatus) => {
  // PENDING -> PROCESSING -> SHIPPING -> COMPLETED
  // PENDING -> PROCESSING -> DECLINED
  // PENDING -> DECLINED

  if (next === OrderStatus.PENDING) {
    return false;
  }

  if (curr === OrderStatus.PENDING) {
    if (next === OrderStatus.PROCESSING) {
      return true;
    } else if (next === OrderStatus.DECLINED) {
      return true;
    }
  }

  if (curr === OrderStatus.PROCESSING) {
    if (next === OrderStatus.DECLINED) {
      return true;
    } else if (next === OrderStatus.SHIPPING) {
      return true;
    }
  }

  if (curr === OrderStatus.SHIPPING && next === OrderStatus.COMPLETED) {
    return true;
  }

  return false;
};

export { orderStatusLifeCycle };
