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
  SelectChangeEvent,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

type WorkGroup = {
  _id: string;
  name: string;
  id?: string;
};



const EditWorkTask = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workGroup: "",
    targetDays: 0,
    bufferDays: 0,
    poDays: 0,
  });

  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingWorkGroups, setLoadingWorkGroups] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        const groupsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/work-groups-selection`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!groupsRes.ok) throw new Error("Failed to fetch work groups.");
        const groupsData = await groupsRes.json();
        setWorkGroups(groupsData);

        const taskRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!taskRes.ok) throw new Error("Failed to fetch work task.");
        const taskData = await taskRes.json();

        setFormData({
          name: taskData.name || "",
          description: taskData.description || "",
          // extract id as string for workGroup
          workGroup: taskData.workGroup?._id?.toString() ?? "",
          targetDays: taskData.targetDays || 0,
          bufferDays: taskData.bufferDays || 0,
          poDays: taskData.poDays || 0,
        });
      } catch (err) {
        setError((err as Error).message || "Failed to load data.");
      } finally {
        setInitialLoading(false);
        setLoadingWorkGroups(false);
      }
    };

    if (id) {
      loadData();
    } else {
      setError("Work Task ID is missing.");
      setInitialLoading(false);
    }
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "targetDays" || name === "bufferDays" || name === "poDays"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, workGroup: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.workGroup || !formData.targetDays) {
      setError("Please fill all required fields.");
      return;
    }

    // Send workGroup as id string directly (not as object)
    const payload = {
      name: formData.name,
      description: formData.description,
      workGroup: formData.workGroup, // <-- just the id string here
      targetDays: formData.targetDays,
      bufferDays: formData.bufferDays,
      poDays: formData.poDays,
    };

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const resBody = await res.json();

      if (!res.ok) {
        throw new Error(resBody.message || "Failed to update work task.");
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
        name="name"
        label="Task Name"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.name}
        onChange={handleChange}
      />

      <TextField
        name="description"
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={formData.description}
        onChange={handleChange}
      />

      <FormControl fullWidth sx={{ mb: 3 }} disabled={loadingWorkGroups || workGroups.length === 0}>
        <InputLabel id="work-group-label">Work Group</InputLabel>
        <Select
          labelId="work-group-label"
          id="work-group-select"
          value={formData.workGroup || ""}
          label="Work Group"
          onChange={handleSelectChange}
        >
          <MenuItem value="" disabled>
            {loadingWorkGroups
              ? "Loading..."
              : workGroups.length === 0
              ? "No Work Groups Available"
              : "Select Work Group"}
          </MenuItem>
          {workGroups
            .filter((group) => group._id || group.id)
            .map((group) => (
              <MenuItem key={group._id || group.id} value={group._id || group.id}>
                {group.name || "Unnamed Group"}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <TextField
        name="targetDays"
        label="Target Days"
        type="number"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.targetDays}
        onChange={handleChange}
      />

      <TextField
        name="bufferDays"
        label="Buffer Days"
        type="number"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.bufferDays}
        onChange={handleChange}
      />

      <TextField
        name="poDays"
        label="PO Days"
        type="number"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.poDays}
        onChange={handleChange}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/work/work-task"> Cancel </CancelButton>
      </Box>
    </Box>
  );
};

export default EditWorkTask;
