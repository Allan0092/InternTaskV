export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface PaymentOrder {
  id: number;
  total: number;
  user: {
    id: number;
    email: string;
  };
}

export interface Payment {
  id: string;
  geteway: string;
  date: string;
  status: PaymentStatus;
  pidx: string;
  expires_at: string | null;
  order: PaymentOrder;
}
