"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditWorkTask = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { token } = getTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workGroup, setWorkGroup] = useState(""); // selected workGroup ID as string
  const [workGroups, setWorkGroups] = useState([]); // list of work groups
  const [targetDays, setTargetDays] = useState(0);
  const [bufferDays, setBufferDays] = useState(0);
  const [poDays, setPoDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Load workGroups first, then fetch workTask details
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        // Fetch work groups list first
        const groupsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/work-groups-selection`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!groupsResponse.ok) throw new Error("Failed to fetch work groups.");

        const groupsData = await groupsResponse.json();
        setWorkGroups(groupsData);

        // Now fetch work task details
        const taskResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!taskResponse.ok) throw new Error("Failed to fetch work task.");

        const taskData = await taskResponse.json();

        // Set fields from task data
        setName(taskData.name || "");
        setDescription(taskData.description || "");
        setTargetDays(taskData.targetDays || 0);
        setBufferDays(taskData.bufferDays || 0);
        setPoDays(taskData.poDays || 0);

        // Set selected workGroup as string ID if present
        const wgId = taskData.workGroup?._id
          ? String(taskData.workGroup._id)
          : "";
        setWorkGroup(wgId);
      } catch (err) {
        setError((err as Error).message || "Failed to load data.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      loadData();
    } else {
      setError("Work Task ID is missing.");
      setInitialLoading(false);
    }
  }, [id, token]);

  // Handle form submit to update work task
  const handleSubmit = async () => {
    if (!name.trim() || !workGroup || !targetDays) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            workGroup,
            targetDays,
            bufferDays,
            poDays,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update work task.");

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
        label="Task Name"
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

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="work-group-label">Work Group</InputLabel>
        <Select
          labelId="work-group-label"
          value={workGroup}
          label="Work Group"
          onChange={(e) => setWorkGroup(String(e.target.value))}
        >
          {workGroups.map((group: any) => (
            <MenuItem key={group._id} value={String(group._id)}>
              {group.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Target Days"
        type="number"
        fullWidth
        sx={{ mb: 3 }}
        value={targetDays}
        onChange={(e) => setTargetDays(Number(e.target.value))}
      />

      <TextField
        label="Buffer Days"
        type="number"
        fullWidth
        sx={{ mb: 3 }}
        value={bufferDays}
        onChange={(e) => setBufferDays(Number(e.target.value))}
      />

      <TextField
        label="PO Days"
        type="number"
        fullWidth
        sx={{ mb: 3 }}
        value={poDays}
        onChange={(e) => setPoDays(Number(e.target.value))}
      />

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
