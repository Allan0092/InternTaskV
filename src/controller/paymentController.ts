import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import axios from "axios";
import { Context } from "koa";

const options = {
  method: "POST",
  url: "https://dev.khalti.com/api/v2/epayment/initiate/",
  headers: {
    Authorization: "key live_secret_key_68791341fdd94846a146f0457ff7b455",
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

export { paymentTest };
