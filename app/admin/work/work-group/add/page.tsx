"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";

const WorkGroup = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { token } = useTokenAndRole(); // Get JWT token

  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return false;
    }
    setError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/work-groups`;

    const workGroupData = {
      name,
      description: description.trim() || "N/A",
    };

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Token for authorization
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workGroupData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create work group. Status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      setSuccess("Work group successfully created!");
      router.push("/admin/work/work-group"); // Redirect to the work group list page
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label=" Work Groups" />
      <Box sx={{ p: 3 }}>
        {/* Heading */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Work Group
        </Typography>

        {/* Name Field */}
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Description Field */}
        <TextField
          label="Description"
          multiline
          rows={3}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Error and Success Messages */}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Submit and Cancel Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </ReusableButton>
          <CancelButton href="/admin/work/work-group">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default WorkGroup;
