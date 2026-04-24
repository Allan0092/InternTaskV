export const LIMIT_OPTIONS = [5, 10, 20, 50];
export const IMG_BASE = "http://localhost:3000/uploads";
export const CATEGORIES = [
  "ELECTRONICS",
  "FASHION",
  "HOME",
  "TOYS",
  "BOOKS",
  "FOOD",
];

export const categoryColors: Record<string, string> = {
  TOYS: "bg-purple-100 text-purple-700",
  BOOKS: "bg-orange-100 text-orange-700",
  FOOD: "bg-green-100 text-green-700",
  FASHION: "bg-pink-100 text-pink-700",
  ELECTRONICS: "bg-blue-100 text-blue-700",
  HOME: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-700",
};

// ── Admin types ──────────────────────────────────────────────────────────────

export type Role = "USER" | "SELLER" | "ADMIN";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  deletedAt: string | null;
}

export interface PublicProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  images: string[];
  userId: number;
  user: { name: string };
}

export interface ProductsResponse {
  products: PublicProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  product: { id: number; name: string };
  price: number;
  quantity: number;
  status: OrderStatus;
}

export interface AdminOrder {
  id: number;
  sku: string;
  buyerUserId: number;
  orderDate: string;
  total: number;
  status: OrderStatus;
  paymentId: number | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  payments: null | unknown;
}

export interface EditOrderForm {
  buyerUserId: number;
  orderDate: string;
  total: number;
  status: OrderStatus;
  orderItems: { id: number; price: number; quantity: number }[];
}

export const roleBadgeColors: Record<Role, string> = {
  USER: "bg-blue-100 text-blue-700",
  SELLER: "bg-green-100 text-green-700",
  ADMIN: "bg-red-100 text-red-700",
};

export const orderStatusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
];

export type ItemStatus =
  | "PENDING"
  | "DECLINE"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED";

export interface OrderItemForSeller {
  id: number;
  quantity: number;
  price: number;
  status: ItemStatus;
  product: {
    user: {
      email: string;
    };
  };
}

export interface Order {
  id: number;
  sku: string;
  buyerUserId: number;
  orderDate: string;
  total: number;
  status: OrderStatus;
  paymentId: string | null;
  orderItems: OrderItemForSeller[];
  user: {
    name: string;
    email: string;
  };
}

export const STATUS_OPTIONS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipping", value: "SHIPPING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPING: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export const itemStatusStyles: Record<ItemStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  DECLINE: "bg-red-100 text-red-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export interface ProductHomePage {
  id: number;
  images: string[];
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  user: { name: string };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  images: string[];
  user?: {
    name?: string;
  };
}
