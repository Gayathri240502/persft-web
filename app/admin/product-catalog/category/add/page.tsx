"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddCategory = () => {
  // State for form fields, room types, and loading/error states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [roomMapping, setRoomTypes] = useState({
    group1: false,
    group2: false,
    group3: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { token } = getTokenAndRole();

  const handleRoomTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomTypes({
      ...roomMapping,
      [event.target.name]: event.target.checked,
    });
  };

  // Validate form fields
  const validateForm = () => {
    if (!name || !description || !thumbnail) {
      setError("Name, description, and thumbnail are required.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const categoryData = {
      name,
      description,
      thumbnail,
      roomMapping: {
        group1: roomMapping.group1,
        group2: roomMapping.group2,
        group3: roomMapping.group3,
      },
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const result = await response.json();
      setSuccess("Category successfully created!");
      router.push("/admin/product-catalog/category");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the category."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form fields or redirect to another page
    setName("");
    setDescription("");
    setThumbnail("");
    setRoomTypes({
      group1: false,
      group2: false,
      group3: false,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Category
      </Typography>

      {/* Name Field */}
      <TextField
        label="Name"
        fullWidth
        sx={{ mb: 3 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Description Field */}
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
        label="Thumbnail"
        fullWidth
        sx={{ mb: 3 }}
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
      />

      {/* Room Mapping */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Room Mapping
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={roomMapping.group1}
                  onChange={handleRoomTypeChange}
                  name="group1"
                />
              }
              label="Group 1"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={roomMapping.group2}
                  onChange={handleRoomTypeChange}
                  name="group2"
                />
              }
              label="Group 2"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={roomMapping.group3}
                  onChange={handleRoomTypeChange}
                  name="group3"
                />
              }
              label="Group 3"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Error and Success Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/category">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddCategory;
