"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddProducts = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Add New Products
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} sm={6}>
          <TextField label="Name" fullWidth sx={{ mb: 3 }} />
          <TextField label="Thumbnail" fullWidth sx={{ mb: 3 }} />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category">
              <MenuItem value="Living Room">Living Room</MenuItem>
              <MenuItem value="Bedroom">Bedroom</MenuItem>
              <MenuItem value="Kitchen">Kitchen</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Price" fullWidth sx={{ mb: 3 }} />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Workshop</InputLabel>
            <Select label="Workshop">
              <MenuItem value="Workshop A">Workshop A</MenuItem>
              <MenuItem value="Workshop B">Workshop B</MenuItem>
              <MenuItem value="Workshop C">Workshop C</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} sm={6}>
          <TextField label="Comhom ID" fullWidth sx={{ mb: 3 }} />
          <TextField label="SKU" fullWidth sx={{ mb: 3 }} />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Sub Category</InputLabel>
            <Select label="Sub Category">
              <MenuItem value="Sofas">Sofas</MenuItem>
              <MenuItem value="Tables">Tables</MenuItem>
              <MenuItem value="Chairs">Chairs</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Brand" fullWidth sx={{ mb: 3 }} />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Word Task</InputLabel>
            <Select label="Word Task">
              <MenuItem value="Assemble">Assemble</MenuItem>
              <MenuItem value="Paint">Paint</MenuItem>
              <MenuItem value="Package">Package</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 3 }} />

      {/* Attributes Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Attributes
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextField label="Attribute 1" fullWidth sx={{ mb: 3 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Attribute 2" fullWidth sx={{ mb: 3 }} />
          </Grid>
        </Grid>
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/product-catalog/products">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddProducts;
