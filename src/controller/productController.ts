import { Category } from "@/generated/prisma/enums.js";
import {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/generated/prisma/models.js";
import {
  createProduct,
  findAllProducts,
  findAllProductsByPagination,
  findAllProductsWithSeller,
  findAndDeleteProduct,
  findAndDisableProduct,
  findAndUpdateProduct,
  findProductsByCategory,
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

const updateProduct = async (ctx: Context) => {
  try {
    const id: number = parseInt(ctx.params.id);
    const productData: ProductUpdateInput = ctx.request
      .body as ProductUpdateInput;

    const product = await findAndUpdateProduct(id, productData);
    if (!product) throw new AppError("Could not find product");

    ctx.body = generateResponseBody({
      success: true,
      message: "product updated successfully.",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      error:
        e instanceof AppError ? e.message : "Could not update product details",
    });
  }
};

const adminDeleteProduct = async (ctx: Context) => {
  try {
    const id: number = parseInt(ctx.params.id);
    const product = await findAndDeleteProduct(id);
    if (!product) throw new AppError("Product not found.");
    ctx.body = generateResponseBody({
      success: true,
      message: "product deleted successfully.",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not delete product",
    });
  }
};

const softDeleteProduct = async (ctx: Context) => {
  try {
    const id: number = parseInt(ctx.params.id);
    const product = await findAndDisableProduct(id);
    if (!product) throw new AppError("Product not found.");
    ctx.body = generateResponseBody({
      success: true,
      message: "product deleted successfully.",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not delete product",
    });
  }
};

const getProductsByPage = async (ctx: Context) => {
  try {
    const pageNum = parseInt(ctx.params.page);
    const products = await findAllProductsByPagination(pageNum);
    if (!products) throw new Error();

    ctx.body = generateResponseBody({
      success: true,
      data: products,
      message: `Products from page ${pageNum} retrieved`,
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not get products",
    });
  }
};

const getProductByCategory = async (ctx: Context) => {
  try {
    const category = ctx.params.category;
    const products = await findProductsByCategory(category);

    if (!products) throw new Error();

    ctx.body = generateResponseBody({
      data: products,
      message: "Products retrieved successfully.",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status;
    ctx.body = generateResponseBody({
      error: e instanceof AppError ? e.message : "Could not get products",
    });
  }
};

export {
  addProduct,
  adminDeleteProduct,
  getAllProducts,
  getAllProductsWithSeller,
  getProductByCategory,
  getProductBySeller,
  getProductsByPage,
  softDeleteProduct,
  updateProduct,
};
