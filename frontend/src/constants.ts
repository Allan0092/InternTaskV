import type { ItemStatus, OrderStatus } from "./types/Order";
import type { PaymentStatus } from "./types/Payment";

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

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

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
