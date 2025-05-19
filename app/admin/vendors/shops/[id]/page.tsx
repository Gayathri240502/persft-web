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
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Shop {
  _id: string;
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
  const { token } = getTokenAndRole();

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
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ marginBottom: 2 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">
              {shop.firstName} {shop.lastName}
            </Typography>
            <Typography color="text.secondary">
              {shop.archive ? "Archived" : "Active"} —{" "}
              {shop.enabled ? "Enabled" : "Disabled"}
            </Typography>
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
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography>
            <strong>ID:</strong> {shop._id}
          </Typography>
          <Typography>
            <strong>Username:</strong> {shop.username}
          </Typography>
          <Typography>
            <strong>Email:</strong> {shop.email}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {shop.phone}
          </Typography>
          <Typography>
            <strong>Owner Name:</strong> {shop.ownerName}
          </Typography>
          <Typography>
            <strong>Address:</strong> {shop.address}
          </Typography>
          <Typography>
            <strong>Country:</strong> {shop.countryName ?? "Not set"}
          </Typography>
          <Typography>
            <strong>State:</strong> {shop.stateName ?? "Not set"}
          </Typography>
          <Typography>
            <strong>City:</strong> {shop.cityName ?? "Not set"}
          </Typography>
          <Typography>
            <strong>Category:</strong> {shop.categoryName ?? "Not set"}
          </Typography>
          <Typography>
            <strong>Subcategory:</strong> {shop.subCategoryName ?? "Not set"}
          </Typography>
          <Typography>
            <strong>Role:</strong>{" "}
            {Array.isArray(shop.role) ? shop.role.join(", ") : "Not set"}
          </Typography>
          <Typography>
            <strong>Created At:</strong>{" "}
            {new Date(shop.createdAt).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Updated At:</strong>{" "}
            {new Date(shop.updatedAt).toLocaleString()}
          </Typography>
        </Box>
      </Paper>

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
  );
};

export default ShopDetailsPage;
