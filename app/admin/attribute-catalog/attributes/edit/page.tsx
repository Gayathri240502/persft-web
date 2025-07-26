"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

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

const EditAttribute = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { token } = useTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/attributes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attribute");
        }

        const attribute = await response.json();

        setFormData({
          name: attribute.name || "",
          description: attribute.description || "",
          type: attribute.type || "",
        });
      } catch (err: any) {
        setError(err.message || "Error fetching attribute data");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchAttribute();
    } else {
      setError("Attribute ID is missing");
      setInitialLoading(false);
    }
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { name, type } = formData;

    if (!name.trim() || !type) {
      setError("Name and Type are required.");
      return;
    }

    const updatedData = {
      name: name.trim(),
      type,
      description: formData.description.trim() || "N/A",
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attributes/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to update attribute");
      }

      router.push("/admin/attribute-catalog/attributes");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Attributes" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Edit Attribute
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Leave blank to default to 'N/A'"
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
            required
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
              {loading ? <CircularProgress size={20} /> : "Update"}
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

export default EditAttribute;
