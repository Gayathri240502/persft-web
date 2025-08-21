"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";

const ProductDetailsPage: React.FC = () => {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch product details");

        const data: any = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete product");

      setDeleteDialogOpen(false);
      router.push("/admin/product-catalog/products");
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

  if (!product) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No product found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Products" />
      <Box p={4}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ marginBottom: 3 }}
        >
          Back
        </Button>

        {/* Main Product Card */}
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {product.name}
              </Typography>
              <Chip
                label={product.archive ? "Inactive" : "Active"}
                color={product.archive ? "default" : "success"}
                size="small"
              />
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(`/admin/product-catalog/products/edit?id=${id}`)
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

          <Divider sx={{ mb: 3 }} />

          {/* Product Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Product Information
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>ID:</strong> {product._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>SKU:</strong> {product.sku}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Brand:</strong> {product.brand}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Model:</strong> {product.modelName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Price:</strong> ₹{product.price}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>COOHOM ID:</strong> {product.coohomId}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Description:</strong> {product.description}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Categorization */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Categorization
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Category:</strong> {product.category?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>SubCategory:</strong> {product.subCategory?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Work Group:</strong> {product.workGroup?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Work Task:</strong> {product.workTask?.name}
              </Typography>
            </Grid>
          </Grid>

          {/* Attributes */}
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Attributes
              </Typography>
              {product.attributeValues?.length > 0 ? (
                <Grid container spacing={2}>
                  {product.attributeValues.map((attr: any, index: any) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Typography>
                        <strong>{attr.attribute.name}:</strong> {attr.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>No attributes available</Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Metadata */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Metadata
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(product.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Updated At:</strong>{" "}
                {new Date(product.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />
        </Paper>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this product? This action cannot
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

export default ProductDetailsPage;
