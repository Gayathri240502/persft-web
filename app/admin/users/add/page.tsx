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
  ListItemText,
  Select,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Roles in lowercase for backend compatibility
// const roles = ["admin", "merchant", "customer", "kisok"];

// Define the type of your form state
interface FormDataType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  enabled: boolean;
  role: ["admin"];
}

const AddUser = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    enabled: true,
    role: ["admin"], // Default role set to "admin"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  // const handleRoleChange = (
  //   e: React.ChangeEvent<{ name?: string; value: unknown }>
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     role: e.target.value as string[],
  //   }));
  // };

  const handleSubmit = async () => {
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
      (field) => !formData[field as keyof FormDataType]
    );

    if (missing.length > 0) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user.");
      }

      router.push("/admin/users");
    } catch (err: any) {
      console.error("Error creating user:", err.message);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New User
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
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

        <Grid item xs={12}>
          <TextField
            label="Username"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </Grid>

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

        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone Number"
            fullWidth
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>

        {/* <Grid item xs={12}>
          <TextField
            select
            label="Role"
            fullWidth
            value={formData.role}
            onChange={(e) => {
              handleRoleChange(e);
              setRoleMenuOpen(false); // Close dropdown on selection
            }}
            SelectProps={{
              multiple: true,
              open: roleMenuOpen,
              onOpen: () => setRoleMenuOpen(true),
              onClose: () => setRoleMenuOpen(false),
              renderValue: (selected) =>
                (selected as string[])
                  .map((val) => val.charAt(0).toUpperCase() + val.slice(1))
                  .join(", "),
            }}
          >
            {roles.map((role, index) => (
              <MenuItem key={index} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid> */}

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

      <Divider sx={{ my: 4 }} />

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
