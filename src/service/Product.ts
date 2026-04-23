import { Category, User } from "@/generated/prisma/client.js";
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductWhereInput,
} from "@/generated/prisma/models.js";
import { prisma } from "@/prisma/prisma.js";

const findAllProducts = async (
  page = 1,
  limit = 10,
  min = 0,
  max = 999999,
  search?: string,
  category?: Category,
) => {
  const searchFilter: ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where: ProductWhereInput = {
    deletedAt: null,
    user: { deletedAt: null },
    category,
    price: { gte: min, lte: max },
    ...searchFilter,
  };

  const totalNum = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { id: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    where,
    omit: { createdAt: true, deletedAt: true, updatedAt: true, userId: true },
  });
  return { products, total: totalNum };
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
    orderBy: { id: "desc" },
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
    select: { images: true },
  });
  if (
    currPhoto?.images.length === 1 &&
    currPhoto?.images[0] === "default.jpg"
  ) {
  } else {
    currPhoto?.images.forEach((p) => photos.push(p));
  }
  const product = await prisma.product.update({
    where: { id: id },
    data: { images: photos },
  });

  return product;
};

const findPublicProduct = async (id: number) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id, deletedAt: null },
    omit: { createdAt: true, updatedAt: true, deletedAt: true, userId: true },
  });
  return product;
};

const findProduct = async (id: number) => {
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  return product;
};

// const checkProductStock = async (id: number, quantity: number) => {
//   const product = await prisma.product.findUnique({ where: { id } });
//   if (!product) return [false, "Could not find product"];

//   const newStock = product?.quantity - quantity;
//   if (newStock < 0) return [false, "Product stock is not enough"];

//   return [true, "Product stock is enough"];
// };

const reduceProductStock = async (id: number, quantity: number) => {
  const result = await prisma.product.updateMany({
    where: { id, quantity: { gte: quantity } },
    data: { quantity: { decrement: quantity } },
  });

  return result.count !== 0; // 0 rows affected, Product not found or stock not enough
};

export {
  // checkProductStock,
  createProduct,
  findAllProducts,
  findAllProductsWithSeller,
  findAndAddPhoto,
  findAndDeleteProduct,
  findAndDisableProduct,
  findAndEnableProduct,
  findAndUpdateProduct,
  findProduct,
  findProductsBySeller,
  findProductSeller,
  findPublicProduct,
  reduceProductStock,
};
