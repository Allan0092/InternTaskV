import { PaymentGateway, PaymentStatus } from "@/generated/prisma/enums.js";
import { prisma } from "@/prisma/prisma.js";

const createPayment = async (
  gateway: PaymentGateway = PaymentGateway.KHALTI,
  pidx: string,
) => {
  const payment = await prisma.payment.create({
    data: {
      geteway: gateway,
      status: PaymentStatus.PENDING,
      pidx,
    },
  });
  return payment;
};

const findAllPayments = async ({
  page = 1,
  limit = 10,
  orderId,
  status,
  from,
  until,
  buyerId,
}: {
  orderId?: number | undefined;
  status?: PaymentStatus | undefined;
  from?: Date | undefined;
  until?: Date | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  buyerId?: number | undefined;
}) => {
  const payments = await prisma.payment.findMany({
    where: {
      status,
      date: { gte: from, lte: until },
      order: { id: orderId, user: { id: buyerId } },
    },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      order: {
        select: {
          id: true,
          total: true,
          user: { select: { email: true, id: true } },
        },
      },
    },
  });
  return payments;
};

const findPaymentById = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  return payment;
};

const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
) => {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status },
  });
  return payment;
};

export { createPayment, findAllPayments, findPaymentById, updatePaymentStatus };
