"use client";

import React, { useEffect, useState } from "react";
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

const EditWorkTask = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();

  const id = searchParams.get("id");

  const [workGroups, setWorkGroups] = useState<any[]>([]);
  const [loadingWorkGroups, setLoadingWorkGroups] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workGroup: "",
    targetDays: 0,
    bufferDays: 0,
    poDays: 0,
  });

  // Fetch work groups for dropdown
  const fetchWorkGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      setWorkGroups(result.data || []);
    } catch (error) {
      setError("Failed to load work groups.");
    } finally {
      setLoadingWorkGroups(false);
    }
  };

  // Fetch the work task details when the component mounts or ID changes
  useEffect(() => {
    if (!id) {
      setInitialLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch work task details.");
        }

        const data = await response.json();
        const workTask = data.data || data;

        setFormData({
          name: workTask.name || "",
          description: workTask.description || "",
          workGroup: workTask.workGroup || "",
          targetDays: workTask.targetDays || 0,
          bufferDays: workTask.bufferDays || 0,
          poDays: workTask.poDays || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
    fetchWorkGroups();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.workGroup) {
      setError("All fields are required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        targetDays: Number(formData.targetDays),
        bufferDays: Number(formData.bufferDays),
        poDays: Number(formData.poDays),
      };

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

      if (!res.ok) {
        throw new Error("Failed to update work task.");
      }

      router.push("/admin/work/work-task");
    } catch (err) {
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Work Task
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {initialLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            fullWidth
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <TextField
            select
            label="Work Group"
            name="workGroup"
            fullWidth
            value={formData.workGroup}
            onChange={handleChange}
            sx={{ mb: 3 }}
            disabled={loadingWorkGroups || workGroups.length === 0}
          >
            <MenuItem value="" disabled>
              {loadingWorkGroups
                ? "Loading..."
                : workGroups.length === 0
                ? "No Work Groups Available"
                : "Select Work Group"}
            </MenuItem>
            {workGroups.map((group) => (
              <MenuItem key={group._id || group.id} value={group._id || group.id}>
                {group.name || "Unnamed Group"}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography>Target Days:</Typography>
            <TextField
              type="number"
              name="targetDays"
              sx={{ width: 120 }}
              value={formData.targetDays}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography>Buffer Days:</Typography>
            <TextField
              type="number"
              name="bufferDays"
              sx={{ width: 120 }}
              value={formData.bufferDays}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography>PO Days:</Typography>
            <TextField
              type="number"
              name="poDays"
              sx={{ width: 150 }}
              value={formData.poDays}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
            </ReusableButton>
            <CancelButton href="/admin/work/work-task">Cancel</CancelButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditWorkTask;
