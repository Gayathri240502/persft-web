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

interface Shop {
  _id: string;
  vendorId?: string; // ✅ Added vendorId
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  archive: boolean;
  role: string[] | null;
  keycloakId: string;
  ownerName: string;
  address: string;
  countryName: string | null;
  stateName: string | null;
  cityName: string | null;
  categoryName: string | null;
  subCategoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

const ShopDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchShop = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch shop");

        const data = await res.json();
        setShop(data.shop);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete shop");

      setDeleteDialogOpen(false);
      router.push("/admin/vendors/shops");
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

  if (!shop) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">Shop not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Shops" />
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
                {shop.firstName} {shop.lastName}
              </Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip
                  label={shop.archive ? "Archived" : "Active"}
                  color={shop.archive ? "default" : "success"}
                  size="small"
                />
                <Chip
                  label={shop.enabled ? "Enabled" : "Disabled"}
                  color={shop.enabled ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(`/admin/vendors/shops/edit?id=${id}`)
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

          {/* Profile Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Profile Information
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Vendor ID:</strong>{" "}
                {shop.vendorId || shop._id /* ✅ fallback */}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Username:</strong> {shop.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Email:</strong> {shop.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Phone:</strong> {shop.phone}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Business Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Business Information
          </Typography>

          <Grid container spacing={2} mb={3}>
            {/* Left Column - 4 items */}
            <Grid item xs={12} sm={6}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Typography>
                    <strong>Owner Name:</strong> {shop.ownerName || "Not set"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    <strong>Address:</strong> {shop.address || "Not set"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    <strong>Country:</strong> {shop.countryName ?? "Not set"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    <strong>State:</strong> {shop.stateName ?? "Not set"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column - 3 items */}
            <Grid item xs={12} sm={6}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Typography>
                    <strong>City:</strong> {shop.cityName ?? "Not set"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    <strong>Category:</strong> {shop.categoryName ?? "Not set"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    <strong>Subcategory:</strong>{" "}
                    {shop.subCategoryName ?? "Not set"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Role & Metadata */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Metadata
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Role:</strong>{" "}
                {Array.isArray(shop.role) ? shop.role.join(", ") : "Not set"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Keycloak ID:</strong> {shop.keycloakId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(shop.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Updated At:</strong>{" "}
                {new Date(shop.updatedAt).toLocaleString()}
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
              Are you sure you want to delete this shop? This action cannot be
              undone.
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

export default ShopDetailsPage;
