"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
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
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface RoomType {
  _id: string;
  name: string;
}

interface Theme {
  _id: string;
  name: string;
  description: string;
  roomTypes: RoomType[];
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const ThemeDetailsPage: React.FC = () => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchTheme = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch theme data");
        }

        const data: Theme = await response.json();
        setTheme(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete theme");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/home-catalog/themes");
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

  if (!theme) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No theme data found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/admin/home-catalog/themes")}
        sx={{ mb: 2 }}
      >
        Back to Themes
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{theme.name}</Typography>
            <Typography color="text.secondary">
              {theme.archive ? "Archived" : "Active"}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() => router.push(`/admin/home-catalog/themes/edit`)}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>ID:</strong> {theme._id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Description:</strong> {theme.description}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Created At:</strong> {new Date(theme.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Updated At:</strong> {new Date(theme.updatedAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Associated Room Types
            </Typography>
            {theme.roomTypes.length === 0 ? (
              <Typography>No associated room types.</Typography>
            ) : (
              theme.roomTypes.map((room) => (
                <Typography key={room._id}>• {room.name}</Typography>
              ))
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this theme? This action cannot be undone.
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

export default ThemeDetailsPage;
