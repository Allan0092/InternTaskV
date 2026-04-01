import { Product, User } from "@/generated/prisma/browser.js";
import { CartItem } from "@/generated/prisma/client.js";
import { OrderItemCreateInput } from "@/generated/prisma/models.js";
import { findProduct } from "@/service/Product.js";
import { AppError } from "@/types/index.js";
import multer, { File } from "@koa/multer";
import { IncomingMessage } from "node:http";

const photoStorage = multer.memoryStorage();

interface ResponseBody {
  success: Boolean;
  message: string;
  data?: User[] | User | Product[] | Product | null | "";
}

const generateResponseBody = ({
  success = false,
  message = "An error occured",
  data = {},
} = {}) => {
  return { success: success, message: message, data: data };
};

// const photoStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads");
//   },
//   filename: (req, file, cb) => {
//     const uniquePrefix = Math.round(Math.random() * 10000);
//     const ext = path.extname(file.originalname);
//     cb(null, uniquePrefix + ext);
//   },
// });

const fileValidation = (
  req: IncomingMessage,
  file: File,
  cb: CallableFunction,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed"), false);
  }
};

const uploadPhoto = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: photoStorage,
  fileFilter: fileValidation,
});

const convertCartItemToOrderItem = async (
  cartItems: CartItem[],
  orderId: number,
): Promise<OrderItemCreateInput[]> => {
  let orderItems: OrderItemCreateInput[] = [];
  for (const cartItem of cartItems) {
    const product = await findProduct(cartItem.productId);
    if (!product) throw new AppError("Could not find product");
    orderItems.push({
      order: { connect: { id: orderId } },
      quantity: cartItem.quantity,
      price: product.price,
      product: { connect: { id: cartItem.productId } },
    });
  }
  return orderItems;
};

export { convertCartItemToOrderItem, generateResponseBody, uploadPhoto };
