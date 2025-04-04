"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const EditSubCategory = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit New Sub Category
      </Typography>

      {/* Category Dropdown */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select labelId="category-select-label" label="Category">
          <MenuItem value="Living Room">Living Room</MenuItem>
          <MenuItem value="Bedroom">Bedroom</MenuItem>
          <MenuItem value="Kitchen">Kitchen</MenuItem>
          <MenuItem value="Bathroom">Bathroom</MenuItem>
        </Select>
      </FormControl>

      {/* Name Field */}
      <TextField label="Name" fullWidth sx={{ mb: 3 }} />

      {/* Description Field */}
      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
      />

      {/* Thumbnail Field */}
      <TextField label="Thumbnail" fullWidth sx={{ mb: 3 }} />

      {/* Room Mapping Checkboxes */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Room Mapping
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel control={<Checkbox />} label="Group 1" />
            <FormControlLabel control={<Checkbox />} label="Group 2" />
            <FormControlLabel control={<Checkbox />} label="Group 3" />
          </Box>
        </Grid>
      </Grid>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/product-catalog/sub-category">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default EditSubCategory;
