"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import CancelButton from "@/app/components/CancelButton";

interface PaymentInfo {
  id: string;
  designAmount: number;
  partialAmount: number;
}

const PaymentInfoPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = getTokenAndRole();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    designAmount: 1000,
    partialAmount: 50,
  });

  const fetchPaymentInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          // No payment info exists yet
          setPaymentInfo(null);
          return;
        }
        throw new Error(`Fetch failed with status ${res.status}`);
      }

      const item = await res.json();
      setPaymentInfo({
        id: item._id,
        designAmount: item.designAmount,
        partialAmount: item.partialAmount,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const handleSubmit = async () => {
    const method = paymentInfo ? "PATCH" : "POST";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/pay-info`;

    const requestBody: {
      designAmount: number;
      partialAmount: number;
      id?: string;
    } = {
      designAmount: formData.designAmount,
      partialAmount: formData.partialAmount,
    };

    if (method === "PATCH" && paymentInfo) {
      requestBody.id = paymentInfo.id;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        setError(
          `Failed to ${method}: ${errorDetails.message || "Unknown error"}`
        );
        throw new Error(
          `Failed to ${method}: ${errorDetails.message || "Unknown error"}`
        );
      }

      setSuccessMsg(
        `Payment info ${method === "POST" ? "added" : "updated"} successfully`
      );
      setDialogOpen(false);
      fetchPaymentInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  };

  const handleOpenDialog = () => {
    if (paymentInfo) {
      // Pre-fill form with existing data for update
      setFormData({
        designAmount: paymentInfo.designAmount,
        partialAmount: paymentInfo.partialAmount,
      });
    } else {
      // Reset form for new entry
      setFormData({
        designAmount: 1000,
        partialAmount: 50,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError(null);
  };

  return (
    <>
      <Navbar label="Payment Info" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {paymentInfo ? (
              // Show existing payment info with update button
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Payment Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Design Amount:</strong> {paymentInfo.designAmount}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Partial Amount:</strong>{" "}
                      {paymentInfo.partialAmount}%
                    </Typography>
                  </Box>
                  <ReusableButton onClick={handleOpenDialog}>
                    Update Payment Info
                  </ReusableButton>
                </CardContent>
              </Card>
            ) : (
              // Show add button when no payment info exists
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "text.secondary" }}
                >
                  No payment information configured
                </Typography>
                <ReusableButton onClick={handleOpenDialog}>
                  Add Payment Info
                </ReusableButton>
              </Box>
            )}
          </Box>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {paymentInfo ? "Update Payment Info" : "Add Payment Info"}
          </DialogTitle>
          <DialogContent
            sx={{
              mt: 2,
              px: 2,
              py: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflow: "visible",
            }}
          >
            <TextField
              label="Design Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.designAmount === 0 ? "" : formData.designAmount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  designAmount: value === "" ? 0 : parseFloat(value),
                });
              }}
            />
            <TextField
              label="Partial Amount (%)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.partialAmount === 0 ? "" : formData.partialAmount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  partialAmount: value === "" ? 0 : parseFloat(value),
                });
              }}
            />
          </DialogContent>
          <DialogActions>
            <CancelButton onClick={handleCloseDialog}>Cancel</CancelButton>
            <ReusableButton variant="contained" onClick={handleSubmit}>
              {paymentInfo ? "Update" : "Add"}
            </ReusableButton>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!successMsg}
          autoHideDuration={3000}
          onClose={() => setSuccessMsg(null)}
          message={successMsg}
        />
      </Box>
    </>
  );
};

export default PaymentInfoPage;
