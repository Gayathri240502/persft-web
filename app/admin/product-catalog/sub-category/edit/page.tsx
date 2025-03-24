"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const EditSubCategory = () => {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [roomMapping, setRoomTypes] = useState({
    group1: false,
    group2: false,
    group3: false,
  });

  const handleRoomTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomTypes({
      ...roomMapping,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Sub Category
      </Typography>

      <TextField
        label="Category"
        fullWidth
        sx={{ mb: 3 }}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

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
            Room Types
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

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/product-catalog/sub-category">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default EditSubCategory;
