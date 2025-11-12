"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

type ResidenceType = { id: string; name: string };

const AddRoomType = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    residenceTypes: [] as string[],
  });

  const [residenceTypeList, setResidenceTypeList] = useState<ResidenceType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingResidenceTypes, setLoadingResidenceTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] =
    useState<string>("No file selected");

  useEffect(() => {
    const fetchResidenceTypes = async () => {
      try {
        setLoadingResidenceTypes(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room-types/residence-types`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch residence types: ${response.status}`
          );
        }

        const raw = await response.json();
        type ApiResidenceType = { id?: string; _id?: string; name?: string };

        const list: unknown = Array.isArray(raw)
          ? raw
          : (raw.residenceTypes ?? raw.data ?? []);

        const normalized: ResidenceType[] = (list as ApiResidenceType[])
          .map((t) => ({
            id: t.id ?? t._id ?? "",
            name: t.name ?? "",
          }))
          .filter((t): t is ResidenceType => t.id !== "" && t.name !== "");

        setResidenceTypeList(normalized);

        setError(null);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch residence types"
        );
        setResidenceTypeList([]);
      } finally {
        setLoadingResidenceTypes(false);
      }
    };

    if (token) fetchResidenceTypes();
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
        ? Array.from(new Set([...prev.residenceTypes, value]))
        : prev.residenceTypes.filter((type) => type !== value),
    }));
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required.");
      return false;
    }
    if (!thumbnail) {
      setError("Thumbnail is required.");
      return false;
    }
    if (formData.residenceTypes.length === 0) {
      setError("At least one residence type must be selected.");
      return false;
    }
    setError(null);
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

    const payload = {
      name: formData.name,
      description: formData.description.trim() || "N/A",
      thumbnail,
      residenceTypes: formData.residenceTypes,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room-types`,
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
        const msg = await response.text().catch(() => "");
        throw new Error(msg || "Failed to create room type");
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
    <>
      <Navbar label="Room Types" />
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
          label="Description (Optional)"
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
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleThumbnailChange}
            />
          </Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            {selectedFileName}
          </Typography>
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

        <Typography variant="h6" sx={{ mb: 1 }}>
          Residence Mapping
        </Typography>
        <FormGroup sx={{ mb: 3 }}>
          {loadingResidenceTypes ? (
            <Typography>Loading residence types...</Typography>
          ) : residenceTypeList.length > 0 ? (
            residenceTypeList.map((res) => (
              <FormControlLabel
                key={res.id}
                control={
                  <Checkbox
                    value={res.id}
                    checked={formData.residenceTypes.includes(res.id)}
                    onChange={handleCheckboxChange}
                  />
                }
                label={res.name}
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
    </>
  );
};

export default AddRoomType;
