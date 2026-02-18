import { Category, Product } from "@/generated/prisma/client.js";
import {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/generated/prisma/models.js";
import { prisma } from "@/prisma/prisma.js";

const findAllProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({ include: { user: true } });
  return products;
};

const findProductsByCategory = async (category: Category) => {
  const products = await prisma.product.findMany({
    where: { category: category },
  });
  return products;
};

const findAllProductsWithSeller = async (): Promise<ProductUpdateInput[]> => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { user: { select: { name: true } } },
  });
  return products.map((product) => ({
    ...product,
    seller: product.user.name,
    user: undefined,
    deletedAt: undefined,
  }));
};

const findProductsBySeller = async (seller: string) => {
  const products = await prisma.product.findMany({
    where: { user: { name: seller } },
  });
  return products;
};

const createProduct = async (product: ProductCreateInput) => {
  const result = await prisma.product.create({ data: product });
  return result;
};

const findAndUpdateProduct = async (
  productId: number,
  productData: ProductUpdateInput,
) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: productData,
  });
  return product;
};

const findAndDeleteProduct = async (productId: number) => {
  const product = await prisma.product.delete({ where: { id: productId } });
  return product;
};

const findAndDisableProduct = async (productId: number) => {
  const now = new Date();
  const product = await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: now },
  });
  return product;
};

const findAndEnableProduct = async (productId: number) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: null },
  });
  return product;
};

export {
  createProduct,
  findAllProducts,
  findAllProductsWithSeller,
  findAndDeleteProduct,
  findAndDisableProduct,
  findAndEnableProduct,
  findAndUpdateProduct,
  findProductsByCategory,
  findProductsBySeller,
};
