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

        // Your data shape has the merchant object nested inside "merchant"
        // Also, businessName, address, categoryName, subCategoryName are outside _doc, so merge properly

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
          sx={{ marginBottom: 2 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4">
                {merchant.firstName} {merchant.lastName}
              </Typography>
              <Typography color="text.secondary">
                {merchant.archive ? "Archived" : "Active"} —{" "}
                {merchant.enabled ? "Enabled" : "Disabled"}
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
              <IconButton
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Box mt={3}>
            <Typography>
              <strong>ID:</strong> {merchant._id}
            </Typography>
            <Typography>
              <strong>Username:</strong> {merchant.username}
            </Typography>
            <Typography>
              <strong>Email:</strong> {merchant.email}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {merchant.phone}
            </Typography>
            <Typography>
              <strong>Business Name:</strong> {merchant.businessName}
            </Typography>
            <Typography>
              <strong>Address:</strong> {merchant.address}
            </Typography>
            <Typography>
              <strong>Category:</strong> {merchant.categoryName ?? "Not set"}
            </Typography>
            <Typography>
              <strong>Subcategory:</strong>{" "}
              {merchant.subCategoryName ?? "Not set"}
            </Typography>
            <Typography>
              <strong>Role:</strong>{" "}
              {Array.isArray(merchant.role)
                ? merchant.role.join(", ")
                : "Not set"}
            </Typography>
            <Typography>
              <strong>Created At:</strong>{" "}
              {new Date(merchant.createdAt).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Updated At:</strong>{" "}
              {new Date(merchant.updatedAt).toLocaleString()}
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
