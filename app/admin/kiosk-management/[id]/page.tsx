"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
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
import Navbar from "@/app/components/navbar/navbar";

interface Kiosk {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  keycloakId: string;
  email: string;
  phone: string;
  role: string[];
  enabled: boolean;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  description: string;
  address: string;
  country: string;
  countryName: string;
  state: string;
  stateName: string;
  city: string;
  cityName: string;
  projects: string[];
  projectNames: string[];
}

const KioskDetailsPage: React.FC = () => {
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      setError("Missing kiosk ID.");
      setLoading(false);
      return;
    }

    const fetchKiosk = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to fetch kiosk details."
          );
        }

        const data: { kiosk: Kiosk } = await res.json();
        setKiosk(data.kiosk);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKiosk();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete kiosk.");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/kiosk-management");
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

  if (!kiosk) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">Kiosk not found.</Alert>
      </Box>
    );
  }

  return (
    <>
    <Navbar label="Kiosk Management"/>
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              {kiosk.firstName} {kiosk.lastName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {kiosk.projects.length > 0
                ? "Assigned Projects"
                : "No Assigned Projects"}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() =>
                router.push(
                  `/admin/kiosk-management/edit?id=${kiosk.keycloakId}`
                )
              }
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
            <Typography>
              <strong>ID:</strong> {kiosk._id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>First Name:</strong> {kiosk.firstName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Last Name:</strong> {kiosk.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Username:</strong> {kiosk.username}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Email:</strong> {kiosk.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Phone:</strong> {kiosk.phone}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Role:</strong> {kiosk.role.join(", ")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Enabled:</strong> {kiosk.enabled ? "Yes" : "No"}
            </Typography>
          </Grid>
          {/* <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Archived:</strong> {kiosk.archive ? "Yes" : "No"}
            </Typography>
          </Grid> */}
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Created At:</strong>{" "}
              {new Date(kiosk.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Updated At:</strong>{" "}
              {new Date(kiosk.updatedAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Description:</strong> {kiosk.description}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Address:</strong> {kiosk.address}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Country:</strong> {kiosk.countryName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>State:</strong> {kiosk.stateName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>City:</strong> {kiosk.cityName}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <strong>Assigned Projects:</strong>{" "}
              {kiosk.projectNames?.join(", ") || "No Projects Assigned"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this kiosk? This action cannot be
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

export default KioskDetailsPage;
