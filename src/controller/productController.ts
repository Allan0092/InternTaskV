import { Category } from "@/generated/prisma/enums.js";
import {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/generated/prisma/models.js";
import {
  createProduct,
  findAllProducts,
  findAndAddPhoto,
  findAndDeleteProduct,
  findAndDisableProduct,
  findAndUpdateProduct,
  findProductsByCategory,
  findProductsBySeller,
} from "@/model/Product.js";
import { findUserByEmail } from "@/model/User.js";
import { AppError, CustomContext } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import fs from "fs/promises";
import { Context } from "koa";
import path from "node:path";

const getAllProducts = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const min = Number(ctx.query.min ?? 0);
    const max = Number(ctx.query.max ?? Number.MAX_SAFE_INTEGER);

    const products = await findAllProducts(page, limit, min, max);
    const maxPages = Math.ceil(products.total / limit);

    ctx.body = generateResponseBody({
      success: true,
      message: "products retrieved successfully",
      data: {
        products: products.products,
        total: products.total,
        page: page,
        totalPages: maxPages,
      },
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not load products",
    });
  }
};

const getAllProductsWithSeller = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);
    const min = Number(ctx.query.min ?? 0);
    const max = Number(ctx.query.max ?? Number.MAX_SAFE_INTEGER);
    const category = ctx.query.category as Category;
    let products;

    if (!category) {
      products = await findAllProducts(page, limit, min, max);
    } else {
      products = await findProductsByCategory(category, page, limit, min, max);
    }
    const maxPages = Math.ceil(products.total / limit);

    ctx.body = generateResponseBody({
      success: true,
      message: "products retrieved successfully",
      data: {
        products: products.products,
        total: products.total,
        page: page,
        totalPages: maxPages,
      },
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not load products",
    });
  }
};

const getProductBySeller = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limti ?? 10);
    const seller = Number(ctx.params.id);
    const products = await findProductsBySeller(seller, page, limit);

    ctx.body = generateResponseBody({
      success: true,
      message: "products retrieved successfully",
      data: products,
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not fetch products",
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
      message: e instanceof AppError ? e.message : "Product could not be added",
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
      message:
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
      message: e instanceof AppError ? e.message : "Could not delete product",
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
      message: e instanceof AppError ? e.message : "Could not delete product",
    });
  }
};

const uploadProductImages = async (ctx: Context & CustomContext) => {
  try {
    const productId = Number(ctx.params.id);
    const files = ctx.files;
    if (!files) throw new AppError("No photos provided.");

    const photos: string[] = [];
    if (files.photo) {
      files.photo.forEach((p) => photos.push(p.filename));
    }
    console.log(photos);

    const product = await findAndAddPhoto(productId, photos);

    if (!product) throw new AppError("Product cannot be found.");
    ctx.body = generateResponseBody({
      success: true,
      message: "photos uploaded successfully",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not get products",
    });
  }
};

const getProductImage = async (ctx: Context) => {
  try {
    const name = ctx.query.name as string;
    const filePath = path.join("public/uploads", name);
    const buffer = await fs.readFile(filePath);

    ctx.type = "image/jpeg";
    ctx.body = buffer;
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      message:
        e instanceof AppError ? e.message : "Could not get product image",
    });
  }
};

export {
  addProduct,
  adminDeleteProduct,
  getAllProducts,
  getAllProductsWithSeller,
  getProductBySeller,
  getProductImage,
  softDeleteProduct,
  updateProduct,
  uploadProductImages,
};
