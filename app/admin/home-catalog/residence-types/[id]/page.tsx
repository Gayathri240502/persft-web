"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";

interface ResidenceType {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  __v: number;
}

const ResidenceTypesPage: React.FC = () => {
  const [residence, setResidence] = useState<ResidenceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchResidenceTypes = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch residence types data");
        }
        const data: ResidenceType = await response.json();
        setResidence(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResidenceTypes();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete residence types");
      }
      setDeleteDialogOpen(false);
      router.push("/admin/home-catalog/residence-types");
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

  if (!residence) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No residenceTypes found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Residence Types" />
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ marginBottom: 2 }}
        >
          Back
        </Button>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {residence.name}
              </Typography>
              {/* <Typography variant="subtitle1" color="textSecondary">
              {residence.archive ? "Active" : "Inactive"}
            </Typography> */}
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(
                    `/admin/home-catalog/residence-types/edit?id=${id}`
                  )
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
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>ID:</strong> {residence._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Name:</strong> {residence.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Descripation:</strong> {residence.description}
              </Typography>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Archived:</strong> {residence.archive ? "Yes" : "No"}
              
            </Typography>
          </Grid> */}

            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Created At:</strong>{" "}
                {new Date(residence.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Updated At:</strong>{" "}
                {new Date(residence.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Thumbnail
            </Typography>
            {residence.thumbnail ? (
              <Box
                component="img"
                src={residence.thumbnail}
                alt="Thumbnail"
                sx={{ maxWidth: 100 }}
              />
            ) : (
              <Typography>No thumbnail available</Typography>
            )}
          </Box>
        </Paper>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be
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
    </>
  );
};

export default ResidenceTypesPage;
