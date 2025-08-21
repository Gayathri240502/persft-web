"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
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

interface Project {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

const ProjectDetailsPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch project details");

        const data: Project = await response.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete project");

      setDeleteDialogOpen(false);
      router.push("/admin/projects");
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

  if (!project) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No project found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Projects" />
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ marginBottom: 2 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {project.archive ? "Archived" : "Active"}
              </Typography>
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() => router.push(`/admin/projects/edit?id=${id}`)}
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

          {/* Details Section */}
          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>ID:</strong> {project._id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Name:</strong> {project.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Description:</strong> {project.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Created At:</strong>{" "}
                  {new Date(project.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Updated At:</strong>{" "}
                  {new Date(project.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Archive:</strong> {project.archive ? "Yes" : "No"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Thumbnail Section */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Thumbnail
            </Typography>
            {project.thumbnail ? (
              <Box
                component="img"
                src={`data:image/jpeg;base64,${project.thumbnail}`}
                alt="Project Thumbnail"
                sx={{
                  maxWidth: 200,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              />
            ) : (
              <Typography color="text.secondary">
                No thumbnail available
              </Typography>
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
              Are you sure you want to delete this project? This action cannot
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

export default ProjectDetailsPage;
