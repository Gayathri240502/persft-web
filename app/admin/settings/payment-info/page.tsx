"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

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
  const [editMode, setEditMode] = useState(false);
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
      setFormData({
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

    if (paymentInfo) {
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
      setEditMode(false);
      fetchPaymentInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  };

  const handleEditClick = () => {
    if (paymentInfo) {
      setFormData({
        designAmount: paymentInfo.designAmount,
        partialAmount: paymentInfo.partialAmount,
      });
    }
    setEditMode(true);
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {paymentInfo
                  ? editMode
                    ? "Update Payment Info"
                    : "Current Payment Information"
                  : "Add Payment Info"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  my: 2,
                }}
              >
                <TextField
                  label="Design Amount"
                  type="number"
                  fullWidth
                  disabled={!editMode}
                  variant="outlined"
                  value={formData.designAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      designAmount: parseFloat(e.target.value),
                    })
                  }
                />

                <TextField
                  label="Partial Amount (%)"
                  type="number"
                  fullWidth
                  disabled={!editMode}
                  variant="outlined"
                  value={formData.partialAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partialAmount: parseFloat(e.target.value),
                    })
                  }
                />
              </Box>

              {editMode ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <ReusableButton onClick={handleSubmit}>Save</ReusableButton>
                  <ReusableButton
                    variant="outlined"
                    onClick={() => {
                      setEditMode(false);
                      if (paymentInfo) {
                        setFormData({
                          designAmount: paymentInfo.designAmount,
                          partialAmount: paymentInfo.partialAmount,
                        });
                      }
                    }}
                  >
                    Cancel
                  </ReusableButton>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <ReusableButton onClick={handleEditClick}>
                    {paymentInfo ? "Update Info" : "Add Info"}
                  </ReusableButton>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

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
