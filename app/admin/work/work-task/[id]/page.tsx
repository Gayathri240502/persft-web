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
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface WorkTask {
  _id: string;
  name: string;
  description: string;
  workGroup: {
    _id: string;
    name: string;
  };
  targetDays: number;
  bufferDays: number;
  poDays: number;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
}

const WorkTaskDetails: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [workTask, setWorkTask] = useState<WorkTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchWorkTask = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch work task");

        const data = await res.json();
        setWorkTask(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkTask();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete work task");

      setDeleteDialogOpen(false);
      router.push("/admin/work/work-task");
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!workTask) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">Work task not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/admin/work/work-task")}
        sx={{ mb: 2 }}
      >
        Back to Work Tasks
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{workTask.name}</Typography>
          <Box>
            <IconButton
              color="primary"
              onClick={() => router.push(`/admin/work/work-task/edit?id=${id}`)}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body1" mt={2}>
          <strong>Description:</strong> {workTask.description}
        </Typography>
        <Typography variant="body1" mt={1}>
          <strong>Work Group:</strong> {workTask.workGroup?.name}
        </Typography>
        <Typography variant="body1" mt={1}>
          <strong>Target Days:</strong> {workTask.targetDays}
        </Typography>
        <Typography variant="body1" mt={1}>
          <strong>Buffer Days:</strong> {workTask.bufferDays}
        </Typography>
        <Typography variant="body1" mt={1}>
          <strong>PO Days:</strong> {workTask.poDays}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={2}>
          <strong>Status:</strong> {workTask.archive ? "Archived" : "Active"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Created At:</strong> {new Date(workTask.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Updated At:</strong> {new Date(workTask.updatedAt).toLocaleString()}
        </Typography>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Work Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this work task? This action cannot be undone.
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

export default WorkTaskDetails;
