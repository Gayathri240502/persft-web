"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";

import { Edit, Delete, ArrowBack } from "@mui/icons-material";
import Navbar from "@/app/components/navbar/navbar";

interface ServiceCharge {
  _id: string;
  name: string;
  code: string;
  calculationMethod: string;
  amount: number;
  isActive: boolean;
  isOptional: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const ServiceChargeDetailsPage: React.FC = () => {
  const [details, setDetails] = useState<ServiceCharge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      setError("Missing Service Charge ID.");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/service-charges/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to fetch service charge details."
          );
        }

        const data = await res.json();
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service-charges/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete service charge.");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/service-charges");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" height="100vh" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" height="100vh" alignItems="center">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!details) {
    return (
      <Box display="flex" justifyContent="center" height="100vh" alignItems="center">
        <Alert severity="warning">Service Charge not found.</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Service Charges" />
      <Box p={4}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                {details.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Code: {details.code}
              </Typography>
            </Box>

            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(`/admin/service-charges/${id}/edit`)
                }
              >
                <Edit />
              </IconButton>

              <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Name:</strong> {details.name}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography><strong>Code:</strong> {details.code}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Calculation:</strong> {details.calculationMethod}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography><strong>Amount:</strong> ₹{details.amount}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Active:</strong> {details.isActive ? "Yes" : "No"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Optional Addon:</strong> {details.isOptional ? "Yes" : "No"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography><strong>Sort Order:</strong> {details.sortOrder}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(details.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Updated At:</strong>{" "}
                {new Date(details.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this service charge? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ServiceChargeDetailsPage;
