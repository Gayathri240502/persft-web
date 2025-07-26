"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
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
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const DesignTypeDetails = () => {
  const { token } = useTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");
  const router = useRouter();

  const [designDetails, setDesignDetails] = useState<{
    _id: string;
    name: string;
    description: string;
    coohomUrl: string;
    thumbnailUrl: string;
    combinations: {
      residenceType: { name: string };
      roomType: { name: string };
      theme: { name: string };
    }[];
  } | null>(null);

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

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
          { headers }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch design");
        }

        const designData = await res.json();

        setDesignDetails({
          _id: designData._id,
          name: designData.name,
          description: designData.description,
          coohomUrl: designData.coohomUrl,
          thumbnailUrl: designData.thumbnail, // base64 string
          combinations: designData.combinations || [],
        });
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

      router.push("/admin/home-catalog/design");
    } catch (err) {
      console.error(err);
      alert("Error deleting the design. Please try again.");
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

  if (!designDetails) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">Design details not found.</Alert>
      </Box>
    );
  }

  const combination = designDetails.combinations[0];

  return (
    <>
      <Navbar label="Design Types" />
      <Box p={4}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ marginBottom: 2 }}
          >
            Back       
          </Button>

          <Box>
            <IconButton
              onClick={() =>
                router.push(
                  `/admin/home-catalog/design/edit?id=${designDetails._id}`
                )
              }
              sx={{ marginRight: 1 }}
            >
              <Edit color="primary" />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)}>
              <Delete color="error" />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
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
                <strong>Coohom URL:</strong>{" "}
                <a
                  href={designDetails.coohomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {designDetails.coohomUrl}
                </a>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Description:</strong> {designDetails.description}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Residence Type:</strong>{" "}
                {combination?.residenceType?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Room Type:</strong>{" "}
                {combination?.roomType?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Theme:</strong> {combination?.theme?.name || "N/A"}
              </Typography>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Thumbnail
            </Typography>
            {designDetails.thumbnailUrl ? (
              <img
                src={`${designDetails.thumbnailUrl}`}
                alt="Thumbnail"
                style={{ width: 150, maxHeight: 150 }}
              />
            ) : (
              <Typography>No thumbnail available</Typography>
            )}
          </Box>
        </Paper>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this design?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" onClick={handleDeleteDesign}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DesignTypeDetails;
