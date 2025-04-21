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

interface Selection {
  _id: string;
}

interface Design {
  _id: string;
  name: string;
  description: string;
  coohomUrl: string;
  thumbnail: string;
  selections: Selection[];
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const DesignDetailsPage: React.FC = () => {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchDesign = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch design data");
        }

        const data: Design = await response.json();
        setDesign(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete design");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/home-catalog/designs");
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

  if (!design) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No design data found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/admin/home-catalog/design")}
        sx={{ mb: 2 }}
      >
        Back to Designs
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{design.name}</Typography>
            <Typography color="text.secondary">
              {design.archive ? "Archived" : "Active"}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() => router.push(`/admin/home-catalog/design/edit`)}
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
            <Typography><strong>ID:</strong> {design._id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Description:</strong> {design.description}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Created At:</strong> {new Date(design.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Updated At:</strong> {new Date(design.updatedAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Coohom URL:</strong>{" "}
              <a href={design.coohomUrl} target="_blank" rel="noopener noreferrer">
                View Design
              </a>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Selections
            </Typography>
            {design.selections.length === 0 ? (
              <Typography>No selections found.</Typography>
            ) : (
              design.selections.map((sel) => (
                <Typography key={sel._id}>• {sel._id}</Typography>
              ))
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Thumbnail
            </Typography>
            {design.thumbnail ? (
              <Box component="img" src={design.thumbnail} alt="Thumbnail" sx={{ maxWidth: 400 }} />
            ) : (
              <Typography>No thumbnail available.</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this design? This action cannot be undone.
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

export default DesignDetailsPage;
