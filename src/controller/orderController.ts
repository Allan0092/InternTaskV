import { OrderItem } from "@/generated/prisma/client.js";
import { OrderItemStatus, OrderStatus } from "@/generated/prisma/enums.js";
import { clearCart, findCartByEmail } from "@/service/Cart.js";
import { notifyUser, notifyUsers } from "@/service/Notification.js";
import {
  findAllOrders,
  findAndUpdateOrder,
  findOrderById,
  findOrderProductsBySku,
  findOrdersByEmail,
  findOrderSellers,
  findSellersOrder,
} from "@/service/Order.js";
import { AppError } from "@/types/index.js";
import {
  convertCartItemToOrderItem,
  generateResponseBody,
} from "@/utils/index.js";
import { Context } from "koa";

const getAllOrders = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const min = Number(ctx.query.min ?? 0);
    const max = Number(ctx.query.max ?? 999999999);
    const orders = await findAllOrders(page, limit, min, max);
    if (!orders) throw new AppError("No orders found");

    ctx.body = generateResponseBody({
      success: true,
      message: "All Orders fetched successfully.",
      data: orders,
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not fetch orders.",
    });
    throw e;
  }
};

const getOrders = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const min = Number(ctx.query.min ?? 0);
    const max = Number(ctx.query.max ?? 999999999);
    const orders = await findOrdersByEmail(email, page, limit, min, max);

    ctx.body = generateResponseBody({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not fetch orders.",
    });
    throw e;
  }
};

const getOrdersForSeller = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const status = ctx.query.status as OrderStatus;
    const orders = await findSellersOrder(email, status);

    ctx.body = generateResponseBody({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 404;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not fetch orders.",
    });
    throw e;
  }
};

const updateOrderStatus = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;
    const orderId = parseInt(ctx.params.id);
    const status = ctx.request.body as { status: OrderStatus };
    const result = await findAndUpdateOrder(orderId, status);

    ctx.body = generateResponseBody({
      success: true,
      message: "Order status updated successfully.",
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

const checkAndUpdateOrderStatusWithSellerUpdate = async (ctx: Context) => {
  try {
    const order = await findOrderById(ctx.state.order.id);

    if (order?.status === OrderStatus.PENDING) {
      const status = order.orderItems.some(
        (item: OrderItem) => item.status === OrderItemStatus.PROCESSING,
      );
      if (status) {
        await findAndUpdateOrder(order?.id, { status: OrderStatus.PROCESSING });

        notifyUser(order.user.email, {
          type: "ORDER_STATUS_UPDATED",
          message: `Your order #${order.id} is now PROCESSING.`,
          data: {
            orderId: order.id,
            orderStatus: OrderStatus.PROCESSING,
          },
        });
      }
    } else if (order?.status === OrderStatus.PROCESSING) {
      const status = order.orderItems.every(
        (item: OrderItem) => item.status === OrderItemStatus.SHIPPED,
      );
      if (status) {
        await findAndUpdateOrder(order?.id, { status: OrderStatus.SHIPPING });

        notifyUser(order.user.email, {
          type: "ORDER_STATUS_UPDATED",
          message: `Your order #${order.id} is now SHIPPING.`,
          data: {
            orderId: order.id,
            orderStatus: OrderStatus.SHIPPING,
          },
        });
      }
    }
  } catch (e: AppError | any) {
    ctx.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      success: false,
      message:
        e instanceof AppError ? e.message : "Could not update order status.",
    });
    throw e;
  }
};

const cancelOrder = async (ctx: Context) => {
  try {
    const orderId = parseInt(ctx.params.id);

    const order = await findOrderById(orderId);

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    if (order.status === OrderStatus.PENDING) {
      await findAndUpdateOrder(orderId, { status: OrderStatus.CANCELLED });
      ctx.body = generateResponseBody({
        success: true,
        message: "Order cancelled successfully.",
      });
    } else if (order.status === OrderStatus.PROCESSING) {
      throw new AppError(
        "Cannot cancel order that is being processed. Please contact support.",
        400,
      );
    } else if (order.status === OrderStatus.SHIPPING) {
      throw new AppError(
        "Cannot cancel order that has already shipped. Please initiate a return instead.",
        400,
      );
    } else if (order.status === OrderStatus.COMPLETED) {
      throw new AppError(
        "Cannot cancel completed order. Please initiate a return if needed.",
        400,
      );
    } else if (order.status === OrderStatus.DECLINED) {
      throw new AppError(
        "This order has already been declined. No further action needed.",
        400,
      );
    } else if (order.status === OrderStatus.CANCELLED) {
      throw new AppError("This order has already been cancelled.", 400);
    } else {
      throw new AppError(
        "Cannot cancel order in current status. Please contact support.",
        400,
      );
    }
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not cancel order.",
    });
    throw e;
  }
};

const placeOrder = async (ctx: Context) => {
  try {
    const email = ctx.state.user.email;

    // Get the user's cart
    const cart = await findCartByEmail(email);
    if (!cart || cart.cartProducts.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Create an empty order first
    const { prisma } = await import("@/prisma/prisma.js");
    const order = await prisma.order.create({
      data: {
        Total: 0,
        status: OrderStatus.PENDING,
        user: { connect: { email } },
      },
    });

    // Convert cart items to order items with order reference
    const orderItems = await convertCartItemToOrderItem(
      cart.cartProducts,
      order.id,
    );

    // Add items to the order and calculate total
    const total = orderItems.reduce(
      (sum, item) => sum + (item.price as number) * (item.quantity as number),
      0,
    );

    await prisma.order.update({
      where: { id: order.id },
      data: {
        Total: total,
        orderItems: {
          createMany: {
            data: orderItems.map((item) => ({
              productId: item.product?.connect?.id || 0,
              quantity: item.quantity as number,
              price: item.price as number,
            })),
          },
        },
      },
    });

    const sellers = await findOrderSellers(order.id);

    notifyUsers(
      sellers.map((seller) => seller.email),
      {
        type: "NEW_ORDER_FOR_SELLER",
        message: `A new order #${order.id} includes your product(s).`,
        data: {
          orderId: order.id,
          buyerEmail: email,
        },
      },
    );

    // Clear the cart after order is placed
    await clearCart(cart.id);

    ctx.body = generateResponseBody({
      success: true,
      message: "Order placed successfully.",
      data: { orderId: order.id },
    });
  } catch (e: AppError | Error | any) {
    ctx.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      success: false,
      message: e instanceof AppError ? e.message : "Could not place order.",
    });
    throw e;
  }
};

// const sendOrderEmails = async (ctx: Context) => {
//   try {
//     const buyerEmail = ctx.state.email;
//     const orderSKU = ctx.request.query.sku as string;
//     const info = await sendNewOrderNotificationToBuyer(buyerEmail, orderSKU);

//   } catch (e: AppError | Error | any) {
//     ctx.status = e.status ?? 400;
//     ctx.body = generateResponseBody({
//       success: false,
//       message: e instanceof AppError ? e.message : "Could not place order.",
//     });
//     throw e;
//   }
// };

const testOrderItems = async (ctx: Context) => {
  const sku = ctx.request.query.sku as string;
  const products = await findOrderProductsBySku(sku);
  console.log(products);
};

export {
  cancelOrder,
  checkAndUpdateOrderStatusWithSellerUpdate,
  getAllOrders,
  getOrders,
  getOrdersForSeller,
  placeOrder,
  testOrderItems,
  // sendOrderEmails,
  updateOrderStatus,
};
