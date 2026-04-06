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

const sendNewOrderNotificationToBuyer = async (
  buyerEmail: string,
  // products: Product[],
  orderSKU: string,
) => {
  const order = await findOrderBySku(orderSKU);
  if (!order) throw new AppError("Could now find order");
  const products = await findOrderProductsBySku(orderSKU);
  const productListText = products
    .map((p) => `  - ${p.product.name} (x${p.quantity}) — Rs. ${p.price}`)
    .join("\n");

  const productListHtml = products
    .map(
      (p) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">${p.product.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${p.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">Rs. ${p.price}</td>
      </tr>`,
    )
    .join("");

  const info = await sendEmail(
    buyerEmail,
    "Your order has been placed successfully!",
    `Hi,\n\nThank you for your order!\n\nOrder SKU: ${orderSKU}\n\nItems ordered:\n${productListText}\n\nWe will notify you once your order has been shipped.\n\nIf you have any questions, reply to this email.\n\n— Real Daraz`,
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#e53935;padding:28px 36px;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:0.5px;">Real Daraz</h1>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Order Confirmed!</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Thank you for shopping with us. Here is a summary of your order.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr style="background:#f9fafb;">
              <th style="padding:10px 0;text-align:left;font-size:13px;color:#374151;">Product</th>
              <th style="padding:10px 0;text-align:center;font-size:13px;color:#374151;">Qty</th>
              <th style="padding:10px 0;text-align:right;font-size:13px;color:#374151;">Price</th>
            </tr>
            ${productListHtml}
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0;font-size:13px;color:#6b7280;">Order Reference</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:#111827;letter-spacing:1px;">${orderSKU}</p>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#374151;font-size:14px;">We will send you another notification once your order has been shipped.</p>
          <p style="margin:0;color:#374151;font-size:14px;">Questions? Just reply to this email.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} Real Daraz. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  );

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

const sendOtpMail = async (
  email: string,
  otp: number,
  expiry: string,
  resetURL: string,
) => {
  const info = await sendEmail(
    email,
    "Your password reset OTP code",
    `Hi,\n\nYou requested a password reset. Use the OTP code below:\n\n${otp}\n\nThis code expires at ${expiry}.\n\nIf you did not request this, please ignore this email — your account is safe.\n\nTo reset your password, visit:\n${resetURL}\n\n— Real Daraz`,
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#e53935;padding:28px 36px;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:0.5px;">Real Daraz</h1>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Password Reset Request</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Use the one-time code below to reset your password. Do not share this code with anyone.</p>

          <div style="text-align:center;background:#f9fafb;border-radius:8px;padding:28px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
            <p style="margin:0;font-size:40px;font-weight:bold;letter-spacing:10px;color:#111827;">${otp}</p>
            <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">Expires at <strong style="color:#374151;">${expiry}</strong></p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td align="center">
              <a href="${resetURL}" style="display:inline-block;background:#e53935;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:15px;font-weight:600;">Reset My Password</a>
            </td></tr>
          </table>

          <p style="margin:0;padding:16px;background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;font-size:13px;color:#92400e;">
            If you did not request a password reset, no action is needed. Your account is safe.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} Real Daraz. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  );
  return info;
};

export {
  sendEmail,
  sendNewOrderNotificationToBuyer,
  sendNewOrderNotificationToSeller,
  sendOtpMail,
};
