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

interface Attribute {
  _id: string;
  name: string;
  description: string;
  type: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const AttributeDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAttribute = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attributes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch attribute");
        }

        const data: Attribute = await res.json();
        setAttribute(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttribute();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attributes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete attribute");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/attribute-catalog/attributes");
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

  if (!attribute) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No attribute found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/admin/attribute-catalog/attributes")}
        sx={{ mb: 2 }}
      >
        Back to Attributes
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{attribute.name}</Typography>
            <Typography color="text.secondary">
              {attribute.archive ? "Archived" : "Active"}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() =>
                router.push(`/admin/attribute-catalog/attributes/edit?id=${id}`)
              }
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography><strong>ID:</strong> {attribute._id}</Typography>
          <Typography><strong>Description:</strong> {attribute.description}</Typography>
          <Typography><strong>Type:</strong> {attribute.type}</Typography>
          <Typography><strong>Created At:</strong> {new Date(attribute.createdAt).toLocaleString()}</Typography>
          <Typography><strong>Updated At:</strong> {new Date(attribute.updatedAt).toLocaleString()}</Typography>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this attribute? This action cannot be undone.
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

export default AttributeDetailsPage;
