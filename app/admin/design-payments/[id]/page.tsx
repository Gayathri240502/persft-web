"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Customer {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

interface Project {
  id: string | null;
  name: string;
}

interface DesignPaymentDetail {
  _id: string;
  amount: number;
  orderId: string;
  paymentId: string;
  validUntil: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  project: Project;
  signature: string;
}

const PaymentOrderDetailPage = () => {
  const { id } = useParams();

  const { token } = getTokenAndRole();

  const [payment, setPayment] = useState<DesignPaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/design-payments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch design payment: ${res.statusText}`);
        }

        const data = await res.json();
        setPayment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, token]);

  if (loading)
    return (
      <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={48} />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 4, maxWidth: 600, mx: "auto" }}>
        {error}
      </Alert>
    );

  if (!payment)
    return (
      <Alert severity="info" sx={{ mt: 4, maxWidth: 600, mx: "auto" }}>
        No design payment found.
      </Alert>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
        Design Payment Details
      </Typography>

      <Grid container spacing={4}>
        {/* Payment Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Info
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>ID:</strong> {payment._id}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Amount:</strong> ₹{payment.amount.toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Order ID:</strong> {payment.orderId}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Payment ID:</strong> {payment.paymentId}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                wordBreak: "break-word",
                fontStyle: "italic",
                color: "text.secondary",
                mt: 1,
              }}
            >
              <strong>Signature:</strong> {payment.signature}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>Valid Until:</strong>{" "}
              {new Date(payment.validUntil).toLocaleString()}
            </Typography>

            {/* <Box sx={{ mt: 1 }}>
              <strong>Status: </strong>
              <Chip
                label={payment.isValid ? "Active" : "Expired"}
                color={payment.isValid ? "success" : "error"}
                size="small"
              />
            </Box> */}

            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              Created: {new Date(payment.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Updated: {new Date(payment.updatedAt).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        {/* Customer Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>Full Name:</strong> {payment.customer.fullName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {payment.customer.email || "N/A"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Phone:</strong> {payment.customer.phone || "N/A"}
            </Typography>
          </Paper>
        </Grid>

        {/* Project Info - full width */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>Project Name:</strong>{" "}
              {payment.project.name || "Unknown Project"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Project ID:</strong> {payment.project.id || "N/A"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentOrderDetailPage;
