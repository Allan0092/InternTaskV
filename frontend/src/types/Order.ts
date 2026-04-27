export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export type BuyerOrder = {
  id: number;
  sku: string;
  buyerUserId: number;
  orderDate: string;
  total: number;
  status: BuyerOrderStatus;
  //   paymentId: string | null;
  orderItems: BuyerOrderItem[];
  payments: {
    id: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
  } | null;
};

export type BuyerOrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export type BuyerOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  status: string;
  product: {
    name: string;
  };
};

export type OrderItem = {
  id: number;
  product: { id: number; name: string };
  price: number;
  quantity: number;
  status: OrderStatus;
};

export type AdminOrder = {
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
};

export type EditOrderForm = {
  buyerUserId: number;
  orderDate: string;
  total: number;
  status: OrderStatus;
  orderItems: { id: number; price: number; quantity: number }[];
};

export type ItemStatus =
  | "PENDING"
  | "DECLINE"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED";

export type OrderItemForSeller = {
  id: number;
  quantity: number;
  price: number;
  status: ItemStatus;
  product: {
    name: string;
    user: {
      email: string;
    };
  };
};

export type Order = {
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
};
