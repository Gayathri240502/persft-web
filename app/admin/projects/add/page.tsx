"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  TextField,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const CreateProject = () => {
  const { token } = getTokenAndRole();

  const [residences, setResidences] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: null as File | null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    residenceType: "",
    roomType: "",
    theme: "",
    designs: "",
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [residencesRes, roomsRes, themesRes, designRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs`, { headers }),
      ]);

      if (!residencesRes.ok || !roomsRes.ok || !themesRes.ok || !designRes.ok) {
        throw new Error("Failed to fetch dropdown data");
      }

      const [residencesData, roomsData, themesData, designsData] = await Promise.all([
        residencesRes.json(),
        roomsRes.json(),
        themesRes.json(),
        designRes.json(),
      ]);

      setResidences(residencesData.residenceTypes);
      setRooms(roomsData.roomTypes);
      setThemes(themesData.themes);
      setDesigns(designsData.designs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          thumbnail: file,
          thumbnailBase64: reader.result as string,
          thumbnailPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      thumbnail: null,
      thumbnailBase64: "",
      thumbnailPreview: "",
    });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.residenceType) newErrors.residenceType = "Residence Type is required";
    if (!formData.roomType) newErrors.roomType = "Room Type is required";
    if (!formData.theme) newErrors.theme = "Theme is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setApiError("Please fix the validation errors");
      return;
    }

    try {
      const projectPayload = {
        name: formData.name,
        description: formData.description,
        thumbnail: formData.thumbnailBase64,
        selections: [
          {
            residenceType: formData.residenceType,
            roomType: formData.roomType,
            theme: formData.theme,
            design: formData.designs,
          },
        ],
      };

      console.log("Project Payload:", projectPayload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectPayload),
      });

      const responseBody = await res.json();

      if (!res.ok) {
        console.error("API error response:", responseBody);
        throw new Error(responseBody.message || "Failed to create project");
      }

      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        thumbnail: null,
        thumbnailBase64: "",
        thumbnailPreview: "",
        residenceType: "",
        roomType: "",
        theme: "",
        designs: "",
      });

      alert("Project added successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      setApiError("An error occurred while creating the project");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add Design Type
      </Typography>

      <TextField
        label="Name"
        name="name"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.name}
        onChange={handleInputChange}
        error={!!errors.name}
        helperText={errors.name}
        required
      />

      <TextField
        label="Description"
        name="description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={formData.description}
        onChange={handleInputChange}
      />

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{
              color: "#05344c",
              borderColor: errors.thumbnail ? "error.main" : "#05344c",
              "&:hover": { backgroundColor: "#f0f4f8" },
            }}
          >
            Upload Thumbnail
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            />
          </Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            {formData.thumbnail?.name || "No file selected"}
          </Typography>

          {formData.thumbnailPreview && (
            <Button
              variant="text"
              color="error"
              onClick={handleRemoveImage}
              size="small"
            >
              Remove
            </Button>
          )}
        </Box>

        {/* Image Preview */}
        {formData.thumbnailPreview && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Image Preview:
            </Typography>
            <Box
              sx={{
                width: 150,
                height: 150,
                border: "1px solid #ddd",
                borderRadius: 1,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.residenceType}>
            <InputLabel required>Residence Type</InputLabel>
            <Select
              value={formData.residenceType}
              onChange={(e) =>
                handleSelectChange("residenceType", e.target.value as string)
              }
              label="Residence Type *"
            >
              {residences.map((res) => (
                <MenuItem key={res._id} value={res._id}>
                  {res.name}
                </MenuItem>
              ))}
            </Select>
            {errors.residenceType && (
              <FormHelperText>{errors.residenceType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.roomType}>
            <InputLabel required>Room Type</InputLabel>
            <Select
              value={formData.roomType}
              onChange={(e) =>
                handleSelectChange("roomType", e.target.value as string)
              }
              label="Room Type *"
            >
              {rooms.map((room) => (
                <MenuItem key={room._id} value={room._id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
            {errors.roomType && (
              <FormHelperText>{errors.roomType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.theme}>
            <InputLabel required>Theme</InputLabel>
            <Select
              value={formData.theme}
              onChange={(e) =>
                handleSelectChange("theme", e.target.value as string)
              }
              label="Theme *"
            >
              {themes.map((theme) => (
                <MenuItem key={theme._id} value={theme._id}>
                  {theme.name}
                </MenuItem>
              ))}
            </Select>
            {errors.theme && <FormHelperText>{errors.theme}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Design</InputLabel>
            <Select
              value={formData.designs}
              onChange={(e) =>
                handleSelectChange("designs", e.target.value as string)
              }
              label="Design"
            >
              {designs.map((design) => (
                <MenuItem key={design._id} value={design._id}>
                  {design.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {apiError && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {apiError}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <ReusableButton onClick={handleSubmit} disabled={!token}>
          Submit
        </ReusableButton>
        <CancelButton  href="/admin/projects">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default CreateProject;
