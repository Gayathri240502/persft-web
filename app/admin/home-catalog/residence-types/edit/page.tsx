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

interface ResidenceType {
  _id: string;
  name: string;
}

const AddRoomType = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "",
    residenceTypes: [] as string[],
  });

  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResidences, setLoadingResidences] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResidenceTypes = async () => {
      try {
        setLoadingResidences(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/residence-types?page=1&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch residence types");
        }

        const result = await response.json();
        setResidenceTypes(result.residenceTypes || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong"
        );
      } finally {
        setLoadingResidences(false);
      }
    };

    fetchResidenceTypes();
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
      residenceTypes: checked
        ? [...prev.residenceTypes, value]
        : prev.residenceTypes.filter((type) => type !== value),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          thumbnail: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.description ||
      formData.residenceTypes.length === 0
    ) {
      setError("All fields are required");
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
        `${process.env.NEXT_PUBLIC_API_URL}/room-types`,
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
        throw new Error("Failed to create room type");
      }

      router.push("/admin/home-catalog/room-types");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while creating"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Room Type
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

      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
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
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {formData.thumbnail ? "Image uploaded" : "No file selected"}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Residence Mapping
      </Typography>

      <FormGroup sx={{ mb: 3 }}>
        {loadingResidences ? (
          <Typography>Loading residence types...</Typography>
        ) : Array.isArray(residenceTypes) && residenceTypes.length > 0 ? (
          residenceTypes.map((residence) => (
            <FormControlLabel
              key={residence._id}
              control={
                <Checkbox
                  value={residence._id}
                  checked={formData.residenceTypes.includes(residence._id)}
                  onChange={handleCheckboxChange}
                />
              }
              label={residence.name}
            />
          ))
        ) : (
          <Typography>No residence types available</Typography>
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
        <CancelButton href="/admin/home-catalog/room-types">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddRoomType;
