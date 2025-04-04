"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Divider,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const roles = ["Admin", "Editor", "Viewer"]; // Add roles as needed

const AddUser = () => {
  return (
    <Box sx={{ p: 4 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New User
      </Typography>

      <Grid container spacing={3}>
        {/* Username */}
        <Grid item xs={12}>
          <TextField label="Username" fullWidth />
        </Grid>

        {/* First Name & Last Name */}
        <Grid item xs={12} sm={6}>
          <TextField label="First Name" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Last Name" fullWidth />
        </Grid>

        {/* Email & Password */}
        <Grid item xs={12} sm={6}>
          <TextField label="Email" type="email" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Password" type="password" fullWidth />
        </Grid>

        {/* Phone Number */}
        <Grid item xs={12}>
          <TextField label="Phone Number" fullWidth />
        </Grid>

        {/* Role Dropdown */}
        <Grid item xs={12}>
          <TextField
            select
            label="Role"
            fullWidth
            defaultValue=""
          >
            {roles.map((role, index) => (
              <MenuItem key={index} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton>Add User</ReusableButton>
        <CancelButton href="/admin/users">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddUser;
