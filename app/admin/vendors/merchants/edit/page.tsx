"use client";

import React from "react";
import { Box, Typography, TextField, Grid, Divider } from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const EditMerchant = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Edit Merchant Details
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} sm={6}>
          {/* Merchant Name Field */}
          <TextField label="Merchant Name" fullWidth sx={{ mb: 3 }} />

          {/* Email Field */}
          <TextField label="Email" fullWidth sx={{ mb: 3 }} />

          {/* Phone Field */}
          <TextField label="Phone" fullWidth sx={{ mb: 3 }} />

          {/* Business Name Field */}
          <TextField label="Business Name" fullWidth sx={{ mb: 3 }} />

          {/* Address Field */}
          <TextField label="Address" fullWidth sx={{ mb: 3 }} />

          {/* Category Field */}
          <TextField label="Category" fullWidth sx={{ mb: 3 }} />
        </Grid>
      </Grid>

      {/* Divider between fields and buttons */}
      <Divider sx={{ my: 3 }} />

      {/* Buttons (Without Form Handling) */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/vendors/merchants">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditMerchant;
