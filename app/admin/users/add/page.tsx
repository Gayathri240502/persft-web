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
  Select,
  InputAdornment,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";

interface FormDataType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  enabled: boolean;
  role: ["admin"];
  countryCode: string;
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
    role: ["admin"],
    countryCode: "+91", // default
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

      const payload = {
        ...formData,
        phone: `${formData.countryCode}${formData.phone}`,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
    <>
      <Navbar label="Users" />
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Select
                      name="countryCode"
                      value={formData.countryCode}
                      // Fix: Use a compatible handler for MUI Select
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          countryCode: e.target.value as string,
                        }))
                      }
                      variant="standard"
                      disableUnderline
                      sx={{ fontSize: "0.9rem", minWidth: "60px" }}
                    >
                      { [
                        "+93", "+355", "+213", "+376", "+244", "+54", "+374", "+61", "+43", "+994",
                        "+973", "+880", "+375", "+32", "+501", "+229", "+975", "+591", "+387", "+267",
                        "+55", "+673", "+359", "+226", "+257", "+855", "+237", "+1", "+86", "+91",
                        "+971", "+44", "+7", "+20", "+33", "+49", "+34", "+39", "+46", "+63", "+66",
                        "+90", "+98", "+212", "+213", "+234", "+27", "+81", "+82", "+84", "+964", "+962",
                        "+251", "+880", "+60", "+977", "+62", "+351", "+48", "+40", "+420", "+421", "+36",
                        "+386", "+385", "+47", "+31", "+358", "+45", "+41", "+64", "+48", "+60", "+356",
                        "+961", "+961", "+880", "+352", "+370", "+389", "+94", "+373", "+380", "+216",
                        "+218", "+374", "+965", "+968", "+974"
                      ].map((code) => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

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
    </>
  );
};

export default AddUser;
