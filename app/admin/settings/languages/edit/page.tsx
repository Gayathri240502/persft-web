"use client";

import React from "react";
import { Box, Typography, Button, TextField, MenuItem } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const EditLanguageSettings = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Language Settings
      </Typography>

      {/* System Name Dropdown */}
      <TextField select label="Language Name" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="Language1">Language 1</MenuItem>
        <MenuItem value="Language2">Language 2</MenuItem>
        <MenuItem value="Language3">Language 3</MenuItem>
      </TextField>

      {/* Category Name Dropdown */}
      <TextField select label="Code" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="code1">Code 1</MenuItem>
        <MenuItem value="code2">Code 2</MenuItem>
        <MenuItem value="code3">Code 3</MenuItem>
      </TextField>
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
        <CancelButton href="/admin/settings/languages">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditLanguageSettings;
