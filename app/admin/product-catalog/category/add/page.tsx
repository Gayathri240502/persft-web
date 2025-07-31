"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(""); // base64 string
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { token } = useTokenAndRole();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 60 * 1024; // 60KB
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG files are allowed.");
        setSelectedFileName("Invalid file type");
        return;
      }

      if (file.size > maxSize) {
        setError("File size exceeds 60KB.");
        setSelectedFileName("File too large");
        return;
      }

      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setThumbnail(base64String);
      };
      reader.readAsDataURL(file);
      setError(null); // Clear error if everything is valid
    }
  };


  const validateForm = () => {
    if (!name) {
      setError("Name is required.");
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

    const payload = {
      name: name.trim(),
      description: description.trim() || "N/A",
      thumbnail,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create category. Status: ${response.status} - ${errorText}`
        );
      }

      await response.json();
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

  return (
    <>
      <Navbar label="Category" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add New Category
        </Typography>

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

        <TextField
          label="Name"
          fullWidth
          sx={{ mb: 3 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Description (Optional)"
          multiline
          rows={3}
          fullWidth
          sx={{ mb: 3 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Leave blank to default to 'N/A'"
        />

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

        <Box sx={{ display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </ReusableButton>
          <CancelButton href="/admin/product-catalog/category">
            Cancel
          </CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default AddCategory;
