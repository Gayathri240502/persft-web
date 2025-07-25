"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Button,
} from "@mui/material";
import { ArrowBack, Edit } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface PaymentConfiguration {
  bookingPercentage: number;
  processingPercentage: number;
  preDeliveryPercentage: number;
  completionPercentage: number;
}

interface DesignOrder {
  orderId: string;
  customerId: string;
  customerEmail: string;
  projectId: string;
  status: string;
  designData: object;
  orderItems: any[];
  totalAmount: number;
  totalPaidAmount: number;
  paymentStages: any[];
  paymentConfiguration: PaymentConfiguration;
  totalPaymentAttempts: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const DesignOrderDetailsPage: React.FC = () => {
  const { id } = useParams(); // Assuming [id] route
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [order, setOrder] = useState<DesignOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch design order");
        }

        const data: DesignOrder = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No design order found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Design Orders" />
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/admin/orders')}
          sx={{ marginBottom: 2 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">{order.orderId}</Typography>
            <IconButton
              color="primary"
              onClick={() =>
                router.push(`/admin/orders/edit?id=${order.orderId}`)
              }
            >
              <Edit />
            </IconButton>
          </Box>

          <Box mt={3}>
            <Typography><strong>Customer ID:</strong> {order.customerId}</Typography>
            <Typography><strong>Email:</strong> {order.customerEmail}</Typography>
            <Typography><strong>Project ID:</strong> {order.projectId}</Typography>
            <Typography><strong>Status:</strong> {order.status}</Typography>
            <Typography><strong>Total Amount:</strong> ₹{order.totalAmount}</Typography>
            <Typography><strong>Total Paid:</strong> ₹{order.totalPaidAmount}</Typography>
            <Typography><strong>Archived:</strong> {order.isArchived ? "Yes" : "No"}</Typography>
            <Typography><strong>Total Payment Attempts:</strong> {order.totalPaymentAttempts}</Typography>
            <Typography mt={2}><strong>Payment Configuration:</strong></Typography>
            <ul>
              <li>Booking: {order.paymentConfiguration.bookingPercentage}%</li>
              <li>Processing: {order.paymentConfiguration.processingPercentage}%</li>
              <li>Pre-Delivery: {order.paymentConfiguration.preDeliveryPercentage}%</li>
              <li>Completion: {order.paymentConfiguration.completionPercentage}%</li>
            </ul>
            <Typography><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
            <Typography><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default DesignOrderDetailsPage;
