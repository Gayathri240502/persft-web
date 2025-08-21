"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Category {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CategoryDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch category");
        }

        const data: Category = await res.json();
        setCategory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete category");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/product-catalog/category");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
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

  // Not found
  if (!category) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No category found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Category" />
      <Box p={4} bgcolor="#f9fafb" minHeight="100vh">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Back
        </Button>

        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h5" fontWeight={600}>
                  {category.name}
                </Typography>
              </Box>
            }
            action={
              <Box>
                <IconButton
                  color="primary"
                  onClick={() =>
                    router.push(`/admin/product-catalog/category/edit?id=${id}`)
                  }
                  sx={{ "&:hover": { bgcolor: "primary.light" } }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ "&:hover": { bgcolor: "error.light" } }}
                >
                  <Delete />
                </IconButton>
              </Box>
            }
          />

          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Category ID:
                </Typography>
                <Typography variant="body1">{category._id}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="bold">
                  Description:
                </Typography>
                <Typography variant="body1">
                  {category.description || "—"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold">
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {new Date(category.createdAt).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold">
                  Updated At:
                </Typography>
                <Typography variant="body1">
                  {new Date(category.updatedAt).toLocaleString()}
                </Typography>
              </Grid>

              {/* Thumbnail */}
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="bold">
                  Thumbnail:
                </Typography>
                {category.thumbnail ? (
                  <Box
                    component="img"
                    src={category.thumbnail}
                    alt="Thumbnail"
                    sx={{
                      width: "100%",
                      maxWidth: 200,
                      borderRadius: 2,
                      boxShadow: 2,
                      mt: 1,
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      width: 120,
                      height: 120,
                      border: "1px dashed #ccc",
                      borderRadius: 2,
                      mt: 1,
                    }}
                  >
                    <ImageIcon color="disabled" />
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ mt: 3 }} />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default CategoryDetailsPage;
