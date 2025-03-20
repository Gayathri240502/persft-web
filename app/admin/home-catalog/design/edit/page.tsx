"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const EditDesignType = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Design Type
      </Typography>

      {/* Cohoom URL Field */}
      <TextField label="Cohoom URL" fullWidth sx={{ mb: 3 }} />

      {/* Name Field */}
      <TextField label="Name" fullWidth sx={{ mb: 3 }} />

      {/* Description Field */}
      <TextField label="Description" multiline rows={3} fullWidth sx={{ mb: 3 }} />

      {/* Thumbnail Upload Section */}
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

      {/* Mappings Section (1x3 format) */}
      <Grid container spacing={3}>
        {/* Residence Mapping */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Residence Types
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel control={<Checkbox />} label="1 BHK" />
            <FormControlLabel control={<Checkbox />} label="2 BHK" />
            <FormControlLabel control={<Checkbox />} label="3 BHK" />
          </Box>
        </Grid>

        {/* Room Mapping */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Room Types
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel control={<Checkbox />} label="Bedroom" />
            <FormControlLabel control={<Checkbox />} label="Living Room" />
            <FormControlLabel control={<Checkbox />} label="Kitchen" />
            <FormControlLabel control={<Checkbox />} label="Bathroom" />
          </Box>
        </Grid>

        {/* Theme Mapping */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Theme Types
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel control={<Checkbox />} label="Modern" />
            <FormControlLabel control={<Checkbox />} label="Minimalist" />
            <FormControlLabel control={<Checkbox />} label="Traditional" />
            <FormControlLabel control={<Checkbox />} label="Industrial" />
          </Box>
        </Grid>
      </Grid>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button variant="contained" sx={{ backgroundColor: "#05344c", "&:hover": { backgroundColor: "#042a3b" } }}>
          Submit
        </Button>
        <Button variant="contained" color="secondary" href="/admin/home-catalog/design">
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditDesignType;
