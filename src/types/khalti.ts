interface PaymentVerification {
  pidx: string;
  total_amount: number;
  status:
    | "Pending"
    | "Completed"
    | "Refunded"
    | "Initiated"
    | "Expired"
    | "User canceled"
    | "Partially Refunded";
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

interface PaymentPlacement {
  pidx: string;
  payment_url: string;
  expires_at: Date;
  expires_in: number;
}

export { PaymentPlacement, PaymentVerification };
