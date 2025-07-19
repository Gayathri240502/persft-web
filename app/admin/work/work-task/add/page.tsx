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
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";

const WorkTaskForm = () => {
  const { token } = getTokenAndRole();
  const Router = useRouter();

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

  useEffect(() => {
    const fetchWorkGroups = async () => {
      setLoadingWorkGroups(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/work-groups-selection`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await res.json();
        console.log("API Response:", result); // Debug
        const groups = result.data || result;
        console.log("Parsed workGroups:", groups); // Debug
        setWorkGroups(Array.isArray(groups) ? groups : []);
      } catch (error) {
        console.error("Error fetching work groups", error);
        setWorkGroups([]);
      } finally {
        setLoadingWorkGroups(false);
      }
    };

    fetchWorkGroups();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`${name} updated to: ${value}`); // Debug
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.workGroup) {
      alert("Please select a valid work group.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const payload = {
        ...formData,
          description: formData.description.trim() || "N/A",

        targetDays: Number(formData.targetDays),
        bufferDays: Number(formData.bufferDays),
        poDays: Number(formData.poDays),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorDetails = await res.text();
        console.error("Error creating work task:", errorDetails);
        // alert("Failed to create work task");
        return;
      } else {
        Router.push("/admin/work/work-task");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (

    <>
    <Navbar label="Create Work Task"/>


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
        value={formData.workGroup || ""}
        onChange={handleChange}
        disabled={loadingWorkGroups || workGroups.length === 0}
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
     </>
  );
};

export default WorkTaskForm;
