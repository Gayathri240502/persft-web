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
import { Edit, Delete } from "@mui/icons-material";
import Navbar from "@/app/components/navbar/navbar";

interface Project {
  _id: string;
  name: string;
  archive: boolean;
  selections: any[];
}

const ProjectDetailsPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchProject();
    }
  }, [id, token]);

  // Delete project API
  const handleDeleteProject = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${project?._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete project");

      router.push("/admin/projects");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box mt={4}>
        <Alert severity="warning">Project not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Edit Project" />
      <Box p={4}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Project Header with Edit/Delete */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
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
                onClick={() =>
                  router.push(`/admin/projects/edit?id=${project._id}`)
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

          {/* Selections Section */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Selections
            </Typography>
            {project.selections && project.selections.length > 0 ? (
              <Grid container spacing={2}>
                {project.selections.map((selection, index) => (
                  <Grid item xs={12} key={`${selection.design._id}-${index}`}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Selection {index + 1}</strong>
                      </Typography>

                      <Grid container spacing={2}>
                        {/* Residence Type */}
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Residence Type:</strong>{" "}
                            {selection.residenceType?.name || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selection.residenceType?.description}
                          </Typography>
                        </Grid>

                        {/* Room Type */}
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Room Type:</strong>{" "}
                            {selection.roomType?.name || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selection.roomType?.description}
                          </Typography>
                        </Grid>

                        {/* Theme */}
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Theme:</strong>{" "}
                            {selection.theme?.name || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selection.theme?.description}
                          </Typography>
                        </Grid>

                        {/* Design */}
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Design:</strong>{" "}
                            {selection.design?.name || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selection.design?.description}
                          </Typography>
                          {selection.design?.coohomUrl && (
                            <Button
                              href={selection.design.coohomUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              View Design
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No selections available
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Project Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Project Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ProjectDetailsPage;
