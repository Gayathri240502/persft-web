"use client";

import React from "react";
import { Box, Typography, Button, TextField, MenuItem } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddLocation = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add Location 
      </Typography>

      {/* System Name Dropdown */}
      <TextField select label="Country" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="Country1">Country 1</MenuItem>
        <MenuItem value="Country2">Country 2</MenuItem>
        <MenuItem value="Country">Country 3</MenuItem>
      </TextField>

      {/* Category Name Dropdown */}
      <TextField select label="State" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="State1">State 1</MenuItem>
        <MenuItem value="State2">State 2</MenuItem>
        <MenuItem value="State3">State 3</MenuItem>
      </TextField>

       {/* Category Name Dropdown */}
       <TextField select label="City" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="City1">City 1</MenuItem>
        <MenuItem value="City2">City 2</MenuItem>
        <MenuItem value="City3">City 3</MenuItem>
      </TextField>

      {/* Name Field */}
      <TextField label="Location Name" fullWidth sx={{ mb: 3 }} />

      {/* Description Field */}
      <TextField label="Description" multiline rows={3} fullWidth sx={{ mb: 3 }} />

      {/* Thumbnail Upload Section (Different Format) */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
          sx={{
            color: "#05344c",
            borderColor: "#05344c",
            "&:hover": { backgroundColor: "#f0f4f8" },
          }}
        >
          Upload Thumbnail
          <input type="file" hidden />
        </Button>
        <Typography variant="body2" sx={{ color: "#666" }}>
          No file selected
        </Typography>
      </Box>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/settings/location">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddLocation;
