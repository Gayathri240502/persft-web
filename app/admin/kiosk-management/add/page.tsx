"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";


const AddProject = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Kiosk Management
      </Typography>

      {/* Kiosk User Field */}
      <TextField label="Kiosk User" fullWidth sx={{ mb: 3 }} />

      {/* Name Field */}
      <TextField label="Project Name" fullWidth sx={{ mb: 3 }} />

      {/* Description Field */}
      <TextField label="Description" multiline rows={3} fullWidth sx={{ mb: 3 }} />

      {/* Location Dropdowns */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>State</InputLabel>
        <Select label="state">
          <MenuItem value="State1">State 1</MenuItem>
          <MenuItem value="State2">State 2</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>District</InputLabel>
        <Select label="Destrict">
          <MenuItem value="District1">District 1</MenuItem>
          <MenuItem value="District2">District 2</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>City</InputLabel>
        <Select label="City">
          <MenuItem value="City1">City 1</MenuItem>
          <MenuItem value="City2">City 2</MenuItem>
        </Select>
      </FormControl>

      {/* Project Mapping */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Project Mapping
      </Typography>
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}>
        <FormControlLabel control={<Checkbox />} label="Rajpushpa" />
        <FormControlLabel control={<Checkbox />} label="Brvteck" />
      </Box>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>
          Submit
        </ReusableButton>
        <CancelButton href="/admin/kiosk-management">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddProject;
