"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const EditRoomType = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit New Room Types
      </Typography>

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
          sx={{ color: "#05344c", borderColor: "#05344c", "&:hover": { backgroundColor: "#f0f4f8" } }}
        >
          Upload Thumbnail
          <input type="file" hidden />
        </Button>
        <Typography variant="body2" sx={{ color: "#666" }}>
          No file selected
        </Typography>
      </Box>

      {/* Residence Mapping */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Residence Mapping
      </Typography>
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}>
        <FormControlLabel control={<Checkbox />} label="1 BHK" />
        <FormControlLabel control={<Checkbox />} label="2 BHK" />
        <FormControlLabel control={<Checkbox />} label="3 BHK" />
      </Box>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" sx={{ backgroundColor: "#05344c", "&:hover": { backgroundColor: "#042a3b" } }}>
          Submit
        </Button>
        <Button variant="contained" color="secondary" href="/admin/home-catalog/room-types">
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditRoomType;
