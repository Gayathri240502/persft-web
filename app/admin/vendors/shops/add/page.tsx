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

const AddShop = () => {
  return (
    <Box sx={{ p: 4 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New Shop
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField label="Shop Name" fullWidth />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Email" fullWidth />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Phone" fullWidth />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Owner Name" fullWidth />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Address" fullWidth />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select label="Category">
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Groceries">Groceries</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/vendors/shops">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddShop;
