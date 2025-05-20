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

interface WorkTaskEntry {
  workTask: string;
  order: number;
}

interface WorkGroupEntry {
  workGroup: string;
  order: number;
  workTasks: WorkTaskEntry[];
}

interface Work {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  workGroups: WorkGroupEntry[];
}

const WorkDetailsPage: React.FC = () => {
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchWork = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch work data");
        const data: Work = await response.json();
        setWork(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to delete work");
      setDeleteDialogOpen(false);
      router.push("/admin/works");
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

  if (!work) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">No work data found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ marginBottom: 2 }}
      >
        Back
      </Button>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              {work.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {work.archive ? "Inactive" : "Active"}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() => router.push(`/admin/works/edit?id=${id}`)}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Description:</strong> {work.description}
            </Typography>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Work Groups
          </Typography>
          {work.workGroups.length === 0 ? (
            <Typography>No work groups assigned.</Typography>
          ) : (
            work.workGroups.map((group, idx) => (
              <Box key={idx} mb={2} p={2} sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
                <Typography variant="subtitle1">
                  <strong>Work Group ID:</strong> {group.workGroup}
                </Typography>
                <Typography variant="body2">
                  <strong>Order:</strong> {group.order}
                </Typography>
                <Box mt={1}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Work Tasks:</strong>
                  </Typography>
                  {group.workTasks.length === 0 ? (
                    <Typography variant="body2">No tasks in this group</Typography>
                  ) : (
                    <ul>
                      {group.workTasks
                        .sort((a, b) => a.order - b.order)
                        .map((task, taskIdx) => (
                          <li key={taskIdx}>
                            Task ID: {task.workTask} (Order: {task.order})
                          </li>
                        ))}
                    </ul>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this work? This action cannot be undone.
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

export default WorkDetailsPage;
