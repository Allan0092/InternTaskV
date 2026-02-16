import { Category } from "@/generated/prisma/enums.js";
import { ProductCreateInput } from "@/generated/prisma/models.js";
import {
  createProduct,
  findAllProducts,
  findAllProductsWithSeller,
  findProductsBySeller,
} from "@/model/Product.js";
import { findUserByEmail } from "@/model/User.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import { Context } from "koa";

const getAllProducts = async (ctx: Context) => {
  try {
    const products = await findAllProducts();

    ctx.body = generateResponseBody({
      success: true,
      message: "products retrieved successfully",
      data: products,
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not load products",
    });
  }
};

const getAllProductsWithSeller = async (ctx: Context) => {
  try {
    const products = await findAllProductsWithSeller();

    ctx.body = generateResponseBody({
      success: true,
      message: "products retrieved successfully",
      data: products,
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not load products",
    });
  }
};

const getProductBySeller = async (ctx: Context) => {
  try {
    const { seller } = ctx.request.body as { seller: string };
    const products = await findProductsBySeller(seller);

    ctx.body = generateResponseBody({
      success: true,
      message: "products retrieved successfully",
      data: products,
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not fetch products",
    });
  }
};

const addProduct = async (ctx: Context) => {
  try {
    const { name, category, price, description } = ctx.request.body as {
      name: string;
      price: number;
      description: string;
      category: Category;
    };
    const product = {
      name,
      price,
      description,
      category,
    };
    const { email } = ctx.state.user;
    const user = await findUserByEmail(email);
    if (!user) throw new AppError("Email not found.");

    const productData: ProductCreateInput = {
      ...product,
      user: { connect: { email: user.email } },
    };

    const result = await createProduct(productData);
    if (!result) throw new Error();

    ctx.body = generateResponseBody({
      success: true,
      message: "product added succcessfully",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Product could not be added",
    });
  }
};

export {
  addProduct,
  getAllProducts,
  getAllProductsWithSeller,
  getProductBySeller,
};
