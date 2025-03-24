"use client";

import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddAttribute = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Attributes
      </Typography>

      <TextField label="Type" fullWidth sx={{ mb: 3 }} type="text" />

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

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/attribute-catalog/attributes">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddAttribute;
