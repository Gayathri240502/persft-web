"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface SubCategory {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: {
    _id: string;
    name: string;
  };
  attributeGroups: {
    _id: string;
    name: string;
  }[];
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const SubCategoryDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSubCategory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sub-category");
        }

        const data: SubCategory = await response.json();
        setSubCategory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategory();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete sub-category");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/product-catalog/sub-category");
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

  if (!subCategory) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No sub-category found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/admin/product-catalog/sub-category")}
        sx={{ mb: 2 }}
      >
        Back to Sub-Categories
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{subCategory.name}</Typography>
            {/* <Typography color="text.secondary">
              {subCategory.archive ? "Archived" : "Active"}
            </Typography> */}
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() => router.push(`/admin/product-catalog/sub-category/edit?id=${id}`)}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography><strong>ID:</strong> {subCategory._id}</Typography>
          <Typography><strong>Description:</strong> {subCategory.description}</Typography>
          <Typography><strong>Category:</strong> {subCategory.category?.name}</Typography>
          <Typography><strong>Created At:</strong> {new Date(subCategory.createdAt).toLocaleString()}</Typography>
          <Typography><strong>Updated At:</strong> {new Date(subCategory.updatedAt).toLocaleString()}</Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">Attribute Groups</Typography>
          {subCategory.attributeGroups.length ? (
            <ul>
              {subCategory.attributeGroups.map((group) => (
                <li key={group._id}>{group.name}</li>
              ))}
            </ul>
          ) : (
            <Typography>No attribute groups linked</Typography>
          )}
        </Box>

        <Box mt={4}>
          <Typography variant="h6">Thumbnail</Typography>
          {subCategory.thumbnail ? (
            <Box
              component="img"
              src={subCategory.thumbnail}
              alt="Thumbnail"
              sx={{ maxWidth: 100 }}
            />
          ) : (
            <Typography>No thumbnail available</Typography>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sub-category? This action cannot be undone.
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

export default SubCategoryDetailsPage;
