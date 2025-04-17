"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const EditWorkGroup = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!name) return setError("Name is required"), false;
    if (!description) return setError("Description is required"), false;
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      // Simulate an API call or success
      setLoading(false);
      alert("Work group updated successfully");
    }, 2000);
  };

  return (
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Work Group
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/home-catalog/work-groups">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default EditWorkGroup;
