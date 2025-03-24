"use client";

import React from "react";
import { Box, Typography, Button, TextField, MenuItem } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddSystemSettings = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add System Settings
      </Typography>

      {/* System Name Dropdown */}
      <TextField select label="System Name" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="system1">System 1</MenuItem>
        <MenuItem value="system2">System 2</MenuItem>
        <MenuItem value="system3">System 3</MenuItem>
      </TextField>

      {/* Category Name Dropdown */}
      <TextField select label="Category Name" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="category1">Category 1</MenuItem>
        <MenuItem value="category2">Category 2</MenuItem>
        <MenuItem value="category3">Category 3</MenuItem>
      </TextField>

      {/* Name Field */}
      <TextField label="Name" fullWidth sx={{ mb: 3 }} />

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
        <CancelButton href="/admin/settings/system-settings">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddSystemSettings;
