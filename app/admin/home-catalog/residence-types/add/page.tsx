"use client";

import React, { useState } from "react";
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
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddResidenceType = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] =
    useState<string>("No file selected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!name) {
      setError("Name is required");
      return false;
    }
    if (!description) {
      setError("Description is required");
      return false;
    }
    if (!thumbnail) {
      setError("Thumbnail is required");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const body = JSON.stringify({
        name,
        description,
        thumbnail, // This is now a base64 string
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
        throw new Error("Failed to create residence type");
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
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 3 }}
      />

<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {/* Upload Section */}
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

  {/* Help Text */}
  <Typography variant="caption" sx={{ color: "#999" }}>
  Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
  </Typography>

  {/* Buttons */}
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
  );
};

export default AddResidenceType;
