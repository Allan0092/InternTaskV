import { OrderStatus } from "@/generated/prisma/enums.js";
import * as yup from "yup";

const orderSchema = yup.object().shape({
  id: yup.number(),
  status: yup.string().oneOf(Object.values(OrderStatus)),
});

const sellerUpdateOrderSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(
      Object.values([
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPING,
        OrderStatus.DECLINED,
      ]),
    )
    .required("Order Status is required."),
});

const userCancelOrderSchema = yup.object().shape({
  status: yup.string().oneOf(Object.values(OrderStatus.CANCELLED)).required(),
});

export { sellerUpdateOrderSchema, userCancelOrderSchema };
