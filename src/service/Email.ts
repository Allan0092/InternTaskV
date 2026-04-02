import { Product } from "@/generated/prisma/client.js";
import "dotenv/config.js";
import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (
  email: string,
  subject: string,
  plainBody: string,
  htmlBody: string,
) => {
  const info = await transporter.sendMail({
    from: '"Real Daraz Website" <therealdaraz@email.com>',
    to: email,
    subject: subject,
    text: plainBody,
    html: htmlBody,
  });

  return info;
};

const sendNewOrderNotificationToSeller = async (
  sellerEmail: string,
  product: Product,
  orderSKU: string,
) => {
  const info = await sendEmail(
    sellerEmail,
    "New Order has been placed",
    `
        A new order has been placed for your product.
        Product name: ${product.name}
        Order Sku: ${orderSKU}
        Please process this order as soon as possible.
        `,
    `<h1>A new order has been placed</h1>`,
  );

  return info;
};

export { sendEmail, sendNewOrderNotificationToSeller };
