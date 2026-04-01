import { OrderStatus } from "@/generated/prisma/enums.js";
import { findOrderBySku } from "@/model/Order.js";
import { findUserByEmail } from "@/model/User.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import axios from "axios";
import "dotenv";
import { Context } from "koa";

const options = {
  method: "POST",
  url: process.env.KHALTI_API,
  headers: {
    Authorization: process.env.KHALTI_KEY,
    "Content-Type": "application/json",
  },
  data: {
    return_url: "http://example.com/payment",
    website_url: "https://example.com/",
    amount: "1000",
    purchase_order_id: "Order01",
    purchase_order_name: "test",
    customer_info: {
      name: "Ram Bahadur",
      email: "test@khalti.com",
      phone: "9800000001",
    },
  },
};

const paymentTest = async (ctx: Context) => {
  try {
    const response = await axios(options);
    console.log(response.data);
    ctx.body = generateResponseBody({
      success: true,
      message: "Payment url recieved",
      data: response.data,
    });
  } catch (e: AppError | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not cancel order.",
    });
    throw e;
  }
};

const getKhaltiUrl = async (ctx: Context) => {
  try {
    // TODO: check order not empty -> get related data(total, name, email, order id)
    const sku = ctx.param.sku as string;
    const email = ctx.state.user.email;

    const order = await findOrderBySku(sku);
    if (!order) throw new AppError("Order cannot be found", 404);

    if (order.status !== OrderStatus.PENDING)
      throw new AppError("Payment already done", 400);

    const user = await findUserByEmail(email);
    if (!user) throw new AppError("User cannot be found", 404);

    const response = await axios({
      method: "POST",
      url: process.env.KHALTI_API,
      headers: {
        Authorization: process.env.KHALTI_KEY,
        "Content-Type": "application/json",
      },
      data: {
        return_url: "http://example.com/payment",
        website_url: "https://example.com/",
        amount: order?.Total,
        purchase_order_id: order?.sku,
        purchase_order_name: `Order ${order.id}`,
        customer_info: {
          name: user.name,
          email: user.email,
          phone: "9800000001",
        },
      },
    });

    ctx.body = generateResponseBody({
      success: true,
      message: "Payment url generated.",
      data: { url: response.data.payment_url },
    });
  } catch (e: AppError | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError
          ? e.message
          : "Could not initiate payment at this moment.",
    });
    throw e;
  }
};

export { getKhaltiUrl, paymentTest };
