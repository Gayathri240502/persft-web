"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddResidenceType = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  if (!name.trim()) {
    setError("Name is required.");
    return false;
  }
  if (!thumbnail) {
    setError("Thumbnail is required.");
    return false;
  }
  return true;
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const body = JSON.stringify({
        name,
        description: description.trim() || "N/A",
        thumbnail,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/residence-types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.message ||
          errorData?.error ||
          "Failed to create residence type";
        throw new Error(message);
      }

      router.push("/admin/home-catalog/residence-types");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label="Residence Types" />
      <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Residence Type
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Description"
          multiline
          rows={3}
          fullWidth
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError(null);
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

          <Typography variant="caption" sx={{ color: "#999" }}>
            Accepted formats: JPG, JPEG, PNG. Max size: 60KB.
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
            <ReusableButton type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </ReusableButton>
            <CancelButton href="/admin/home-catalog/residence-types">
              Cancel
            </CancelButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddResidenceType;
