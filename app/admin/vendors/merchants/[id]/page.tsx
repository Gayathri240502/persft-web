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

interface Merchant {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  archive: boolean;
  businessName: string;
  address: string;
  role: string[];
  categoryName: string;
  subCategoryName: string;
  createdAt: string;
  updatedAt: string;
}

const MerchantDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMerchant = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch merchant");

        const data = await res.json();
        setMerchant(data);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to delete merchant");

      setDeleteDialogOpen(false);
      router.push("/admin/vendors/merchants");
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  if (!merchant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">Merchant not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/admin/vendors/merchants")}
        sx={{ mb: 2 }}
      >
        Back to Merchants
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{merchant.firstName} {merchant.lastName}</Typography>
            <Typography color="text.secondary">
              {merchant.archive ? "Archived" : "Active"} — {merchant.enabled ? "Enabled" : "Disabled"}
            </Typography>
          </Box>
          <Box>
            <IconButton color="primary" onClick={() => router.push(`/admin/vendors/merchants/edit`)}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography><strong>Username:</strong> {merchant.username}</Typography>
          <Typography><strong>Email:</strong> {merchant.email}</Typography>
          <Typography><strong>Phone:</strong> {merchant.phone}</Typography>
          <Typography><strong>Business Name:</strong> {merchant.businessName}</Typography>
          <Typography><strong>Address:</strong> {merchant.address}</Typography>
          <Typography><strong>Category:</strong> {merchant.categoryName}</Typography>
          <Typography><strong>Subcategory:</strong> {merchant.subCategoryName}</Typography>
          <Typography><strong>Role:</strong> {merchant.role.join(", ")}</Typography>
          <Typography><strong>Created At:</strong> {new Date(merchant.createdAt).toLocaleString()}</Typography>
          <Typography><strong>Updated At:</strong> {new Date(merchant.updatedAt).toLocaleString()}</Typography>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this merchant? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MerchantDetailsPage;
