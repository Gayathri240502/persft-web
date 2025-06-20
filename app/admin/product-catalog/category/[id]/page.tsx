"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Category {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const CategoryDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch category data");
        }

        const data: Category = await response.json();
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/product-catalog/category");
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

  if (!category) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No category data found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Category" />
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
              <Typography variant="h4">{category.name}</Typography>
              {/* <Typography color="text.secondary">
              {category.archive ? "Archived" : "Active"}
            </Typography> */}
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(`/admin/product-catalog/category/edit?id=${id}`)
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
              <strong>ID:</strong> {category._id}
            </Typography>
            <Typography>
              <strong>Description:</strong> {category.description}
            </Typography>
            <Typography>
              <strong>Created At:</strong>{" "}
              {new Date(category.createdAt).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Updated At:</strong>{" "}
              {new Date(category.updatedAt).toLocaleString()}
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Thumbnail
            </Typography>
            {category.thumbnail ? (
              <Box
                component="img"
                src={category.thumbnail}
                alt="Thumbnail"
                sx={{ maxWidth: 100 }}
              />
            ) : (
              <Typography>No thumbnail available</Typography>
            )}
          </Box>
        </Paper>

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
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default CategoryDetailsPage;
