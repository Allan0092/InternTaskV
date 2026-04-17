import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

type CheckStatus = "loading" | "success" | "error";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [status, setStatus] = useState<CheckStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const paymentStatus = searchParams.get("status");
  const sku = searchParams.get("purchase_order_id");
  const orderName = searchParams.get("purchase_order_name") ?? "";
  const transactionId = searchParams.get("transaction_id") ?? "";
  const totalAmount = searchParams.get("total_amount");

  useEffect(() => {
    if (!sku) {
      setErrorMsg("Missing order information.");
      setStatus("error");
      return;
    }

    api
      .get("/api/payment/check", {
        params: { sku },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setStatus("success"))
      .catch(() => {
        setErrorMsg("Could not verify payment. Please contact support.");
        setStatus("error");
      });
  }, [sku, token]);

  const formattedAmount =
    totalAmount != null
      ? `₨${(Number(totalAmount) / 100).toLocaleString()}`
      : null;

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Verification Failed
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {errorMsg ?? "Something went wrong."}
          </p>
          <Link
            to="/my-orders"
            className="inline-block px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Payment Successful
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Your payment has been confirmed and your order is being processed.
        </p>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 text-left mb-7">
          {orderName && (
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500">Order</span>
              <span className="text-xs font-medium text-gray-700">
                {decodeURIComponent(orderName)}
              </span>
            </div>
          )}
          {paymentStatus && (
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500">Status</span>
              <span className="text-xs font-medium text-green-600">
                {paymentStatus}
              </span>
            </div>
          )}
          {formattedAmount && (
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500">Amount Paid</span>
              <span className="text-xs font-semibold text-blue-600">
                {formattedAmount}
              </span>
            </div>
          )}
          {transactionId && (
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500">Transaction ID</span>
              <span className="text-xs font-medium text-gray-600 truncate max-w-45">
                {transactionId}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/my-orders"
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
