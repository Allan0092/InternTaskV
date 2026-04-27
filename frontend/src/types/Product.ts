export type Category =
  | "ELECTRONICS"
  | "FASHION"
  | "HOME"
  | "TOYS"
  | "BOOKS"
  | "FOOD";

export type PublicProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: Category;
  quantity: number;
  images: string[];
  userId: number;
  user: { name: string };
};

export type ProductsResponse = {
  products: PublicProduct[];
  total: number;
  page: number;
  totalPages: number;
};

export type ProductHomePage = {
  id: number;
  images: string[];
  name: string;
  price: number;
  description: string;
  category: Category;
  quantity: number;
  user: { name: string };
};

export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: Category;
  quantity: number;
  images: string[];
  user?: {
    name?: string;
  };
};

export type SellerProduct = Product & {
  createdAt: string;
  userId: number;
};

export type ProductSearch = Product & {
  createdAt: string;
  userId: number;
  user: {
    name: string;
  };
};

export type ProductsSearchResponse = {
  products: ProductSearch[];
  total: number;
  page: number;
  totalPages: number;
};
