"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const WorkTaskForm = () => {
  const [workGroups, setWorkGroups] = useState<any[]>([]);
  const [loadingWorkGroups, setLoadingWorkGroups] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workGroup: "",
    targetDays: 0,
    bufferDays: 0,
    poDays: "",
  });

  // Fetch work groups on mount
  useEffect(() => {
    const fetchWorkGroups = async () => {
      setLoadingWorkGroups(true);
      try {
        const res = await fetch("/api/v1/work-groups");
        const result = await res.json();

        console.log("Fetched Work Groups:", result);

        // Adjust based on your API response format
        setWorkGroups(result.data || result);
      } catch (error) {
        console.error("Error fetching work groups", error);
      } finally {
        setLoadingWorkGroups(false);
      }
    };

    fetchWorkGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    try {
      const payload = {
        ...formData,
        targetDays: Number(formData.targetDays),
        bufferDays: Number(formData.bufferDays),
        poDays: Number(formData.poDays),
      };

      const res = await fetch("/api/v1/work-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`, // Uncomment if auth is needed
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Something went wrong");
      }

      alert("Work task created successfully!");
      // Optionally reset form or redirect
    } catch (error) {
      console.error("Error creating work task:", error);
      alert("Failed to create work task");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Create Work Task
      </Typography>

      <TextField
        label="Name"
        name="name"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.name}
        onChange={handleChange}
      />

      <TextField
        label="Description"
        name="description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={formData.description}
        onChange={handleChange}
      />

      <TextField
        select
        label="Work Group"
        name="workGroup"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.workGroup}
        onChange={handleChange}
        disabled={loadingWorkGroups}
      >
        {loadingWorkGroups ? (
          <MenuItem disabled>Loading...</MenuItem>
        ) : workGroups.length > 0 ? (
          workGroups.map((group: any) => (
            <MenuItem key={group._id} value={group._id}>
              {group.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No work groups found</MenuItem>
        )}
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
        <ReusableButton onClick={handleSubmit} disabled={loadingSubmit}>
          {loadingSubmit ? <CircularProgress size={20} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/work/work-task">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default WorkTaskForm;
