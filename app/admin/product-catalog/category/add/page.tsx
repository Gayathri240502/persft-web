"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(""); // base64 string
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { token } = getTokenAndRole();


  const handleThumbnailChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setThumbnail(base64String);
        };
        reader.readAsDataURL(file);
      }
    };

  const validateForm = () => {
    if (!name || !description || !thumbnail) {
      setError("Name, description, and thumbnail are required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Ensure the correct API URL
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/categories`; // Correct the endpoint here

    const categoryData = { name, description, thumbnail };

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create category. Status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      setSuccess("Category successfully created!");
      router.push("/admin/product-catalog/category");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while creating the category."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name); // Set the file name
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setThumbnail(reader.result.toString()); // base64 string
      }
    };
    reader.readAsDataURL(file); // Converts file to base64 string
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Category
      </Typography>

      {/* Error/Success Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Name Field */}
      <TextField
        label="Name"
        fullWidth
        sx={{ mb: 3 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Description Field */}
      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Thumbnail Upload */}
      <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Button
      variant="outlined"
      component="label"
      startIcon={<UploadFileIcon />}
      sx={{
        color: "#05344c",
        borderColor: "#05344c",
        "&:hover": { backgroundColor: "#f0f4f8" },
      }}
    >
      Upload Thumbnail
      <input type="file" hidden onChange={handleThumbnailChange} />
    </Button>
    <Typography variant="body2" sx={{ color: "#666" }}>
      {selectedFileName}
    </Typography>
  </Box>
      </Box>
      {/* Help Text */}
        <Typography variant="caption" sx={{ color: "#999" }}>
        Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
        </Typography>
        {thumbnail && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2">Preview:</Typography>
                      <img
                        src={thumbnail}
                        alt="Thumbnail Preview"
                        style={{ width: 200, borderRadius: 8 }}
                      />
                    </Box>
                  )}
       

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/category">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddCategory;
