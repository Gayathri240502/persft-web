"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const typeOptions = [
  "text",
  "number",
  "boolean",
  "date",
  "color",
  "textarea",
  "email",
  "url",
];

const AddAttribute = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { name, description, type } = formData;

    if (!name || !description || !type) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attributes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to create attribute");
      }

      router.push("/admin/attribute-catalog/attributes");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label="Add New Attribute" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add New Attribute
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            select
            fullWidth
            sx={{ mb: 3 }}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Submit"}
            </ReusableButton>
            <CancelButton href="/admin/attribute-catalog/attributes">
              Cancel
            </CancelButton>
          </Box>
        </form>
      </Box>
    </>
  );
};

export default AddAttribute;
