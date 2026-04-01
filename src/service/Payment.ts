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

export { createPayment, findPaymentById, updatePaymentStatus };
