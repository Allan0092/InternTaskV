import { Category, User } from "@/generated/prisma/client.js";
import {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/generated/prisma/models.js";
import { prisma } from "@/prisma/prisma.js";

const findAllProducts = async (page = 1, limit = 10, min = 0, max = 999999) => {
  const totalNum = await prisma.product.count({
    where: { price: { gte: min, lte: max }, deletedAt: null },
  });
  const products = await prisma.product.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { id: "asc" },
    skip: (page - 1) * limit,
    take: limit,
    where: { deletedAt: null, price: { gte: min, lte: max } },
    omit: { deletedAt: true },
  });
  return { products: products, total: totalNum };
};

const findProductsByCategory = async (
  category: Category,
  page = 1,
  limit = 10,
  min = 0,
  max = 999999,
) => {
  const totalNum = await prisma.product.count({
    where: {
      category: category,
      price: { gte: min, lte: max },
      deletedAt: null,
    },
  });
  const products = await prisma.product.findMany({
    where: {
      category: category,
      deletedAt: null,
      price: { gte: min, lte: max },
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  return { products: products, total: totalNum };
};

const findAllProductsWithSeller = async (
  page = 1,
  limit = 10,
  min = 0,
  max = 999999,
): Promise<ProductUpdateInput[]> => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, price: { gte: min, lte: max } },
    include: { user: { select: { name: true } } },
    orderBy: { id: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return products.map((product) => ({
    ...product,
    seller: product.user.name,
    user: undefined,
    deletedAt: undefined,
  }));
};

const findProductsBySeller = async (id: number, page = 1, limit = 10) => {
  const products = await prisma.product.findMany({
    where: { user: { id: id }, deletedAt: null },
    skip: (page - 1) * limit,
    take: limit,
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

const findAndAddPhoto = async (id: number, photos: string[]) => {
  const currPhoto = await prisma.product.findUnique({
    where: { id: id },
    select: { picture: true },
  });
  if (
    currPhoto?.picture.length === 1 &&
    currPhoto?.picture[0] === "default.jpg"
  ) {
  } else {
    currPhoto?.picture.forEach((p) => photos.push(p));
  }
  const product = await prisma.product.update({
    where: { id: id },
    data: { picture: photos },
  });

  return product;
};

export {
  createProduct,
  findAllProducts,
  findAllProductsWithSeller,
  findAndAddPhoto,
  findAndDeleteProduct,
  findAndDisableProduct,
  findAndEnableProduct,
  findAndUpdateProduct,
  findProductsByCategory,
  findProductsBySeller,
  findProductSeller,
};
