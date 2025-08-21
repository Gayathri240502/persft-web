"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";

interface Merchant {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  archive: boolean;
  role: string[] | null;
  createdAt: string;
  updatedAt: string;
  businessName: string;
  address: string;
  categoryName: string;
  subCategoryName: string;
}

const MerchantDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMerchant = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch merchant");

        const data = await res.json();

        const mergedMerchant: Merchant = {
          ...data.merchant._doc,
          businessName: data.merchant.businessName ?? "",
          address: data.merchant.address ?? "",
          categoryName: data.merchant.categoryName ?? "",
          subCategoryName: data.merchant.subCategoryName ?? "",
        };

        setMerchant(mergedMerchant);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchant();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete merchant");

      setDeleteDialogOpen(false);
      router.push("/admin/vendors/merchants");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  if (!merchant) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">Merchant not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Merchants" />
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {merchant.firstName} {merchant.lastName}
              </Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip
                  label={merchant.archive ? "Archived" : "Active"}
                  color={merchant.archive ? "default" : "success"}
                  size="small"
                />
                <Chip
                  label={merchant.enabled ? "Enabled" : "Disabled"}
                  color={merchant.enabled ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(`/admin/vendors/merchants/edit?id=${id}`)
                }
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Business Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Business Information
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Business Name:</strong>{" "}
                {merchant.businessName || "Not set"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Category:</strong> {merchant.categoryName || "Not set"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Subcategory:</strong>{" "}
                {merchant.subCategoryName || "Not set"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Address:</strong> {merchant.address || "Not set"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Contact Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Email:</strong> {merchant.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Phone:</strong> {merchant.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Username:</strong> {merchant.username}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* System Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>ID:</strong> {merchant._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Role:</strong>{" "}
                {Array.isArray(merchant.role)
                  ? merchant.role.join(", ")
                  : "Not set"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(merchant.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Updated At:</strong>{" "}
                {new Date(merchant.updatedAt).toLocaleString()}
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
              Are you sure you want to delete this merchant? This action cannot
              be undone.
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

export default MerchantDetailsPage;
