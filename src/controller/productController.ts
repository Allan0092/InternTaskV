import {
  findAllProducts,
  findAllProductsWithSeller,
  findProductsBySeller,
} from "@/model/Product.js";
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

export { getAllProducts, getAllProductsWithSeller, getProductBySeller };
