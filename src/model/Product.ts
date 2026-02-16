import { Product } from "@/generated/prisma/client.js";
import { prisma } from "@/prisma/prisma.js";

const findAllProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany();
  return products;
};

export { findAllProducts };
