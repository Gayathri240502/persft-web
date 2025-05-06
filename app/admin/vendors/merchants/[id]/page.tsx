"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface Merchant {
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
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Use query param ?id=

  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id || !token) return;

    const fetchMerchant = async () => {
      setLoading(true);
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

        if (!res.ok) {
          throw new Error(`Failed to fetch merchant: ${res.statusText}`);
        }

        const data: Merchant = await res.json();
        setMerchant(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
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
        <Alert severity="error">{error}</Alert>
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
        <Alert severity="warning">No merchant found</Alert>
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h4">{merchant.username}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {merchant.archive ? "Inactive" : "Active"}
          </Typography>
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
          <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
            <Delete />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>ID:</strong> {merchant._id}
          </Typography>
          <Typography>
            <strong>Email:</strong> {merchant.email}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {merchant.phone}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>Name:</strong> {merchant.firstName} {merchant.lastName}
          </Typography>
          <Typography>
            <strong>Business:</strong> {merchant.businessName}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>Address:</strong> {merchant.address}
          </Typography>
          <Typography>
            <strong>Category:</strong> {merchant.categoryName}
          </Typography>
          <Typography>
            <strong>SubCategory:</strong> {merchant.subCategoryName}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>Created At:</strong>{" "}
            {new Date(merchant.createdAt).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Updated At:</strong>{" "}
            {new Date(merchant.updatedAt).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this merchant? This action cannot be
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

export default MerchantDetailsPage;
