"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const PaymentsPage = () => {
  const params = useParams();
  const orderId = params.orderId; // or: const { orderId } = useParams();
  const { token } = useTokenAndRole();

  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  console.log(
    "PaymentsPage rendered with orderId:",
    orderId,
    "and token:",
    token
  );

  useEffect(() => {
    if (!orderId || !token) return;

    const fetchPayments = async () => {
      try {
        const response = await fetch(
          `/admin/design-orders/${orderId}/payments`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch payments");
        }

        const data = await response.json();
        setPayments(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        console.error("Error fetching payments:", err);
      }
    };

    fetchPayments();
  }, [orderId, token]);

  return null; // No UI rendering
};

export default PaymentsPage;
