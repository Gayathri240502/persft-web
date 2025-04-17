"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession"; // Import the helper function

const roles = ["Admin", "User"]; // Add roles as needed

const AddUser = () => {
  const router = useRouter();
  const { token } = getTokenAndRole(); // Get token from the session helper

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    enabled: true,
    role: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value as string[], // Assuming multiple roles can be selected
    }));
  };

  const handleSubmit = async () => {
    // Validate form data
    const requiredFields = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "password",
      "role",
    ];
    const missing = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missing.length > 0) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(""); // Reset error state

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token here
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          enabled: formData.enabled,
          role: formData.role,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user.");
      }

      router.push("/admin/users"); // Redirect to users list page
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New User
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* First Name & Last Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            fullWidth
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            fullWidth
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Grid>

        {/* Username */}
        <Grid item xs={12}>
          <TextField
            label="Username"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>

        {/* Phone Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone Number"
            fullWidth
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>

        {/* Role Dropdown */}
        <Grid item xs={12}>
          <TextField
            select
            label="Role"
            fullWidth
            value={formData.role}
            onChange={handleRoleChange}
            SelectProps={{
              multiple: true, // Allow multiple roles to be selected
            }}
          >
            {roles.map((role, index) => (
              <MenuItem key={index} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Password */}
        <Grid item xs={12}>
          <TextField
            label="Password"
            type="password"
            fullWidth
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Add User"}
        </ReusableButton>
        <CancelButton href="/admin/users">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddUser;
