"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface WorkTask {
  _id: string;
  name: string;
  // Add other fields if needed
}

const EditWorkTask = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { token } = getTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [selectedWorkTask, setSelectedWorkTask] = useState("");
  const [targetDays, setTargetDays] = useState(0);
  const [bufferDays, setBufferDays] = useState(0);
  const [poDate, setPoDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchWorkTasks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      setWorkTasks(result.workTasks || []);
    } catch (err) {
      console.error("Error fetching work tasks:", err);
    }
  };

  const fetchWorkTask = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch work task.");
      }

      const data = await response.json();
      setName(data.name);
      setDescription(data.description);
      setSelectedWorkTask(data.workTask);
      setTargetDays(data.targetDays);
      setBufferDays(data.bufferDays);
      setPoDate(data.poDate);
    } catch (err) {
      setError("Failed to fetch work task.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWorkTasks();
      fetchWorkTask();
    } else {
      setError("Work Task ID is missing.");
      setInitialLoading(false);
    }
  }, [id, token]);

  const handleSubmit = async () => {
    if (!name.trim() || !selectedWorkTask) {
      setError("Work task name, work task selection, and target days are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          workTask: selectedWorkTask,
          targetDays,
          bufferDays,
          poDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update work task.");
      }

      router.push("/admin/work/work-task");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Work Task
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Work Task Name"
        fullWidth
        sx={{ mb: 3 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <TextField
        select
        label="Work Task"
        fullWidth
        sx={{ mb: 3 }}
        value={selectedWorkTask}
        onChange={(e) => setSelectedWorkTask(e.target.value)}
      >
        {workTasks.map((task) => (
          <MenuItem key={task._id} value={task._id}>
            {task.name}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography>Target Days:</Typography>
        <TextField
          type="number"
          sx={{ width: 120 }}
          value={targetDays}
          onChange={(e) => setTargetDays(Number(e.target.value))}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography>Buffer Days:</Typography>
        <TextField
          type="number"
          sx={{ width: 120 }}
          value={bufferDays}
          onChange={(e) => setBufferDays(Number(e.target.value))}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography>PO Date:</Typography>
        <TextField
          type="date"
          sx={{ width: 150 }}
          value={poDate}
          onChange={(e) => setPoDate(e.target.value)}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/work/work-task">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditWorkTask;
