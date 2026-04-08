import {
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from "@/generated/prisma/enums.js";
import {
  sendNewOrderNotificationToBuyer,
  sendNewOrderNotificationToSeller,
} from "@/service/Email.js";
import { findAndUpdateOrder, findOrderBySku } from "@/service/Order.js";
import {
  createPayment,
  findPaymentById,
  updatePaymentStatus,
} from "@/service/Payment.js";
import { findUserByEmail } from "@/service/User.js";
import { AppError } from "@/types/index.js";
import { PaymentPlacement, PaymentVerification } from "@/types/khalti.js";
import { generateResponseBody } from "@/utils/index.js";
import axios from "axios";
import "dotenv";
import { Context } from "koa";

type Options = {
  method: string;
  url: string;
  headers: Record<string, any>;
  data: Record<string, any>;
};
// const data = {
//   users :  {
//     roles: {

//     }
//   }
// }

// ?? => null | undefinde
// || -? null ,undesin ,0 , false ,

// user.roles ?? 'fallback1'
// user.roles || 'fallback2'
// data?.users.roles;

const options: Options = {
  method: "POST",
  url: process.env.KHALTI_API!,
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
    const sku = ctx.query.sku as string;
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
        return_url: "http://localhost:5173/my-orders",
        website_url: "http://localhost:5173/",
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

    const responseData: PaymentPlacement = response.data;

    const payment = await createPayment(
      PaymentGateway.KHALTI,
      responseData.pidx,
    );

    if (!payment) throw new AppError("Could not save payment info", 500);

    await findAndUpdateOrder(order.id, { payments: { connect: payment } });

    ctx.body = generateResponseBody({
      success: true,
      message: "Payment url generated.",
      data: { url: responseData.payment_url },
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

const checkKhaltiPaymentStatus = async (ctx: Context) => {
  try {
    const sku = ctx.query.sku as string;
    const email = ctx.state.user.email;

    const order = await findOrderBySku(sku);
    if (!order) throw new AppError("Order cannot be found", 404);

    if (order.status !== OrderStatus.PENDING)
      throw new AppError("Payment already done", 400);

    if (!order.paymentId) throw new AppError("Payment could not be found", 404);

    const payment = await findPaymentById(order.paymentId);

    if (!payment) throw new AppError("Payment could not be found", 404);

    const pidx = payment.pidx;

    const user = await findUserByEmail(email);
    if (!user) throw new AppError("User cannot be found", 404);

    try {
      const response = await axios({
        method: "POST",
        url: process.env.KHALTI_VERIFY_API,
        headers: {
          Authorization: process.env.KHALTI_KEY,
          "Content-Type": "application/json",
        },
        data: {
          pidx,
        },
      });

      const paymentData: PaymentVerification = response.data;

      switch (paymentData.status) {
        case "Completed": {
          await updatePaymentStatus(payment.id, PaymentStatus.SUCCESS);
          await sendNewOrderNotificationToBuyer(email, sku);
          await sendNewOrderNotificationToSeller(sku);
        }
      }

      ctx.body = generateResponseBody({
        success: true,
        message: "Payment Status Fetched.",
        data: { status: paymentData.status },
      });
    } catch (e: any) {
      const status = e.response.status;
      const data: PaymentVerification = e.response.data;
      // TODO: Handle each case
      throw new AppError(data.status, 400);
    }
  } catch (e: AppError | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError
          ? e.message
          : "Could not fetch payment status at this moment.",
    });
    throw e;
  }
};

export { checkKhaltiPaymentStatus, getKhaltiUrl, paymentTest };
