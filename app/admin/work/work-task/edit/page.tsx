"use client";

import React from "react";
import { Box, Typography, TextField, MenuItem } from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const EditWorkTask = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Work Group
      </Typography>

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

      {/* Work Task Dropdown */}
      <TextField select label="Work Task" fullWidth sx={{ mb: 3 }}>
        <MenuItem value="task1">Task 1</MenuItem>
        <MenuItem value="task2">Task 2</MenuItem>
        <MenuItem value="task3">Task 3</MenuItem>
      </TextField>

      {/* Target Days */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography>Target Days:</Typography>
        <TextField type="number" sx={{ width: 120 }} defaultValue={0} />
      </Box>

      {/* Buffer Days */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography>Buffer Days:</Typography>
        <TextField type="number" sx={{ width: 120 }} defaultValue={0} />
      </Box>

      {/* PO Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography>PO Date:</Typography>
        <TextField type="date" sx={{ width: 150 }} />
      </Box>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Submit</ReusableButton>
        <CancelButton href="/admin/work/work-task">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditWorkTask;
