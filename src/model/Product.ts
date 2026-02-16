import { Category, Product } from "@/generated/prisma/client.js";
import { ProductCreateInput } from "@/generated/prisma/models.js";
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

const findAllProductsWithSeller = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    include: { user: { select: { name: true } } },
  });
  return products.map((product) => ({
    ...product,
    seller: product.user.name,
    user: undefined,
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

export {
  createProduct,
  findAllProducts,
  findAllProductsWithSeller,
  findProductsByCategory,
  findProductsBySeller,
};
