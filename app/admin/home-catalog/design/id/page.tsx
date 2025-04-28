"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams,  } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const DesignTypeDetails = () => {
  const { token } = getTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");
  const router = useRouter();

  const [designDetails, setDesignDetails] = useState<{
    name: string;
    description: string;
    coohomUrl: string;
    thumbnailUrl: string;
    combinations: { residenceType: string; roomType: string; theme: string }[];
  } | null>(null);

  const [residenceName, setResidenceName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { id } = useParams();

  useEffect(() => {
    const fetchDesignDetails = async () => {
      if (!designId) {
        setError("Design ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const designRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
          { headers }
        );

        if (!designRes.ok) {
          const errorData = await designRes.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch design details (status ${designRes.status})`
          );
        }

        const designData = await designRes.json();
        setDesignDetails(designData);

        if (designData.combinations && designData.combinations.length > 0) {
          const combination = designData.combinations[0];
          const [residenceData, roomData, themeData] = await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${combination.residenceType}`,
              { headers }
            ).then((res) => res.json()),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/room-types/${combination.roomType}`,
              { headers }
            ).then((res) => res.json()),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/themes/${combination.theme}`,
              { headers }
            ).then((res) => res.json()),
          ]);

          setResidenceName(residenceData?.residenceType?.name || "N/A");
          setRoomName(roomData?.roomType?.name || "N/A");
          setThemeName(themeData?.theme?.name || "N/A");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch design details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDesignDetails();
  }, [designId, token]);

  const handleDeleteDesign = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete the design.");
      }

      router.push("/admin/home-catalog/designs");
    } catch (err) {
      console.error(err);
      alert("Error deleting the design. Please try again.");
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!designDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">Design details not found.</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* Top Section with Back, Edit, Delete */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/admin/home-catalog/designs")}
        >
          Back to Designs
        </Button>

        <Box>
          <IconButton
            onClick={() => router.push(`/admin/home-catalog/design/edit?id=${id}`)}
            sx={{ marginRight: 1 }}
          >
            <Edit color="primary" />
          </IconButton>
          <IconButton onClick={() => setDeleteDialogOpen(true)}>
            <Delete color="error" />
          </IconButton>
        </Box>
      </Box>

      {/* Design Details */}
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          {designDetails.name}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Name:</strong> {designDetails.name}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Coohom URL:</strong> {designDetails.coohomUrl}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Description:</strong> {designDetails.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              <strong>Residence Type:</strong> {residenceName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              <strong>Room Type:</strong> {roomName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              <strong>Theme:</strong> {themeName}
            </Typography>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Thumbnail
          </Typography>
          {designDetails.thumbnailUrl ? (
            <Box
              component="img"
              src={designDetails.thumbnailUrl}
              alt="Thumbnail"
              sx={{ maxWidth: 150, borderRadius: 2 }}
            />
          ) : (
            <Typography>No thumbnail available</Typography>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this design?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteDesign}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignTypeDetails;
