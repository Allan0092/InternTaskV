import { OrderItemStatus } from "@/generated/prisma/enums.js";
import * as yup from "yup";

const sellerUpdateOrderItemSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(
      Object.values([
        OrderItemStatus.PROCESSING,
        OrderItemStatus.SHIPPED,
        OrderItemStatus.DECLINE,
      ]),
    )
    .required("Order Status is required."),
  orderId: yup.number().min(1).required("Order id is required."),
  orderItemId: yup.number().min(1).required("Order item id is required."),
});

export { sellerUpdateOrderItemSchema };
