"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface RoomType {
  _id: string;
  name: string;
}

const AddTheme = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "",
    roomTypes: [] as string[],
  });

  const [roomTypeList, setRoomTypeList] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoadingRoomTypes(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room-types`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch room types: ${response.status}`);
        }

        const result = await response.json();
        const types = result.roomTypes || [];

        setRoomTypeList(types);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch room types"
        );
      } finally {
        setLoadingRoomTypes(false);
      }
    };

    fetchRoomTypes();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      roomTypes: checked
        ? [...prev.roomTypes, value]
        : prev.roomTypes.filter((type) => type !== value),
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate size (max 60KB)
      if (file.size > 60 * 1024) {
        setError("Image must be less than 60KB");
        return;
      }

      // Validate format
      const validFormats = ["image/jpeg", "image/png", "image/jpg"];
      if (!validFormats.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG formats are accepted");
        return;
      }

      setError(null);
      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          thumbnail: base64,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.description ||
      formData.roomTypes.length === 0 
      
    ) {
      setError("All fields including thumbnail are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/themes`,
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
        throw new Error("Failed to create theme");
      }

      router.push("/admin/home-catalog/themes");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Theme
      </Typography>

      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        fullWidth
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
      />

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
        Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
      </Typography>

      {formData.thumbnail && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle2">Preview:</Typography>
          <img
            src={formData.thumbnail}
            alt="Thumbnail Preview"
            style={{ width: 200, borderRadius: 8 }}
          />
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>
        Map Room Types
      </Typography>
      <FormGroup sx={{ mb: 3 }}>
        {loadingRoomTypes ? (
          <Typography>Loading room types...</Typography>
        ) : roomTypeList.length > 0 ? (
          roomTypeList.map((room) => (
            <FormControlLabel
              key={room._id}
              control={
                <Checkbox
                  value={room._id}
                  checked={formData.roomTypes.includes(room._id)}
                  onChange={handleCheckboxChange}
                />
              }
              label={room.name}
            />
          ))
        ) : (
          <Typography>No room types available</Typography>
        )}
      </FormGroup>

      {error && (
        <Typography sx={{ mb: 2, color: "error.main", fontWeight: "bold" }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/home-catalog/themes">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddTheme;
