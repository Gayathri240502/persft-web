"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material"; // Added missing imports
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddAttributeGroups = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Attributes Groups
      </Typography>

      {/* Name Field */}
      <TextField label="Group Name" fullWidth sx={{ mb: 3 }} />

      {/* Description Field */}
      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
      />

      {/* Select Attributes */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Select Attributes
      </Typography>
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Model" />
          <FormControlLabel control={<Checkbox />} label="Finish" />
        </FormGroup>
      </FormControl>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/attribute-catalog/attributes-groups">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddAttributeGroups;
