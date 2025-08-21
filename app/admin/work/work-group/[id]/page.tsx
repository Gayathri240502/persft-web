"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";

interface WorkGroup {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
}

const WorkGroupDetails: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [workGroup, setWorkGroup] = useState<WorkGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchWorkGroup = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-groups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch work group");

        const data = await res.json();
        setWorkGroup(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkGroup();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-groups/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete work group");

      setDeleteDialogOpen(false);
      router.push("/admin/work/work-group");
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

  if (!workGroup) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">Work group not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Work Groups" />
      <Box p={{ xs: 2, md: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Back
        </Button>

        {/* WorkGroup Card */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: "column", md: "row" }}
            mb={2}
          >
            {/* Avatar + Title */}
            <Box display="flex" alignItems="center" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {workGroup.name}
                </Typography>
                <Chip
                  label={workGroup.archive ? "Archived" : "Active"}
                  color={workGroup.archive ? "default" : "success"}
                  size="small"
                />
              </Box>
            </Box>

            {/* Action Icons */}
            <Box>
              <IconButton
                color="primary"
                sx={{ "&:hover": { bgcolor: "rgba(5, 54, 73, 0.08)" } }}
                onClick={() =>
                  router.push(`/admin/work/work-group/edit?id=${id}`)
                }
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                sx={{ "&:hover": { bgcolor: "rgba(244, 67, 54, 0.08)" } }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* WorkGroup Details */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {workGroup.description || "No description provided"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Created At
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(workGroup.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Updated At
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(workGroup.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle fontWeight={700}>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this work group? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none" }}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default WorkGroupDetails;
