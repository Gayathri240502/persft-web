"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";

interface Merchants {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  businessName: string;
  address: string;
  categoryName: string;
  subCategoryName: string;
}

const MerchantDetailsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchMerchants = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch merchant data");
        const data: Merchants = await res.json();
        setMerchants(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete merchant");
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

  if (!merchants) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No merchant found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button startIcon={<ArrowBack />} onClick={() => router.push("/admin/vendors/merchants")} sx={{ mb: 3 }}>
        Back to Merchants
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4">{merchants.username}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {merchants.archive ? "Inactive" : "Active"}
          </Typography>
        </Box>
        <Box>
          <IconButton color="primary" onClick={() => router.push(`/admin/vendors/merchants/edit?id=${id}`)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
            <Delete />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography><strong>ID:</strong> {merchants._id}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>First Name:</strong> {merchants.firstName}</Typography>
          <Typography><strong>Last Name:</strong> {merchants.lastName}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Email:</strong> {merchants.email}</Typography>
          <Typography><strong>Phone:</strong> {merchants.phone}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Business Name:</strong> {merchants.businessName}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Address:</strong> {merchants.address}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Category:</strong> {merchants.categoryName}</Typography>
          <Typography><strong>Subcategory:</strong> {merchants.subCategoryName}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Created At:</strong> {new Date(merchants.createdAt).toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Updated At:</strong> {new Date(merchants.updatedAt).toLocaleString()}</Typography>
        </Grid>
      </Grid>

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
