import { Category, Product, User } from "@/generated/prisma/client.js";
import {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/generated/prisma/models.js";
import { prisma } from "@/prisma/prisma.js";

const findAllProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    include: { user: true },
    orderBy: { id: "asc" },
  });
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
    orderBy: { id: "asc" },
  });
  return products.map((product) => ({
    ...product,
    seller: product.user.name,
    user: undefined,
    deletedAt: undefined,
  }));
};

const findProductsBySeller = async (id: number) => {
  const products = await prisma.product.findMany({
    where: { user: { id: id } },
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

const findProductSeller = async (
  productId: number,
): Promise<User | undefined> => {
  const user = await prisma.product.findUnique({
    where: { id: productId },
    select: { user: true },
  });
  return user?.user;
};

const filterProductByCategory = async (category: Category) => {
  const products = await prisma.product.findMany({
    where: { category: category },
  });
  return products;
};

const findAllProductsByPagination = async (
  page: number = 1,
  limit: number = 10,
) => {
  const products = await prisma.product.findMany({
    skip: page * limit,
    take: limit,
  });
  return products;
};

export {
  createProduct,
  filterProductByCategory,
  findAllProducts,
  findAllProductsByPagination,
  findAllProductsWithSeller,
  findAndDeleteProduct,
  findAndDisableProduct,
  findAndEnableProduct,
  findAndUpdateProduct,
  findProductsByCategory,
  findProductsBySeller,
  findProductSeller,
};
