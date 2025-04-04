"use client";

import React from "react";
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddAttribute = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Attributes
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type">
              <MenuItem value="Type1">Type1</MenuItem>
              <MenuItem value="Type2">Type2</MenuItem>
              <MenuItem value="Type3">Type3</MenuItem>
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
