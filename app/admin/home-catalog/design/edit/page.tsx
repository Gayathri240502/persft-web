"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useSearchParams } from "next/navigation";

const EditDesignType = () => {
  const { token } = getTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");

  const [residences, setResidences] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coohomUrl: "",
    thumbnail: null as File | null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    residenceType: "",
    roomType: "",
    theme: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    coohomUrl: "",
    residenceType: "",
    roomType: "",
    theme: "",
    thumbnail: "",
  });

  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // URL validation regex
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  // MongoDB ObjectId validation regex
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

  // Allowed file types
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxFileSize = 60 * 1024; // 60kb

  const validateForm = () => {
    const newErrors = {
      name: "",
      coohomUrl: "",
      residenceType: "",
      roomType: "",
      theme: "",
      thumbnail: "",
    };

    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name should not be empty";
      isValid = false;
    }

    // Coohom URL validation
    if (!formData.coohomUrl.trim()) {
      newErrors.coohomUrl = "Coohom URL should not be empty";
      isValid = false;
    } else if (!urlRegex.test(formData.coohomUrl)) {
      newErrors.coohomUrl = "Coohom URL must be a valid URL";
      isValid = false;
    }

    // Residence Type validation
    if (!formData.residenceType) {
      newErrors.residenceType = "Residence Type should not be empty";
      isValid = false;
    } else if (!mongoIdRegex.test(formData.residenceType)) {
      newErrors.residenceType = "Residence Type must be a valid MongoDB ID";
      isValid = false;
    }

    // Room Type validation
    if (!formData.roomType) {
      newErrors.roomType = "Room Type should not be empty";
      isValid = false;
    } else if (!mongoIdRegex.test(formData.roomType)) {
      newErrors.roomType = "Room Type must be a valid MongoDB ID";
      isValid = false;
    }

    // Theme validation
    if (!formData.theme) {
      newErrors.theme = "Theme should not be empty";
      isValid = false;
    } else if (!mongoIdRegex.test(formData.theme)) {
      newErrors.theme = "Theme must be a valid MongoDB ID";
      isValid = false;
    }

    // For edit, thumbnail is not required if we already have one
    if (
      !formData.thumbnail &&
      !formData.thumbnailBase64 &&
      !formData.thumbnailPreview
    ) {
      newErrors.thumbnail = "Please upload a thumbnail image";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user selects an option
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Convert file to base64
  const fileToBase64 = (
    file: File
  ): Promise<{ fullUrl: string; base64: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Get the full data URL for preview
          const fullDataUrl = reader.result;
          // Extract only the base64 part without the prefix for API
          const base64String = reader.result.split(",")[1];
          resolve({ fullUrl: fullDataUrl, base64: base64String });
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file type
      if (!allowedFileTypes.includes(file.type)) {
        setErrors({
          ...errors,
          thumbnail: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
        });
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        setErrors({
          ...errors,
          thumbnail: "File size exceeds 60kb limit.",
        });
        return;
      }

      try {
        // Convert file to base64
        const { fullUrl, base64 } = await fileToBase64(file);

        setFormData({
          ...formData,
          thumbnail: file,
          thumbnailBase64: base64,
          thumbnailPreview: fullUrl,
        });
        setErrors({ ...errors, thumbnail: "" });
      } catch (err) {
        setErrors({
          ...errors,
          thumbnail: "Failed to process the image.",
        });
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch design data and dropdown options in parallel
      const [designRes, residencesRes, roomsRes, themesRes] = await Promise.all(
        [
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`, {
            headers,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, {
            headers,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes`, { headers }),
        ]
      );

      if (!designRes.ok) {
        throw new Error("Failed to fetch design data");
      }

      if (!residencesRes.ok || !roomsRes.ok || !themesRes.ok) {
        throw new Error("Failed to fetch dropdown data");
      }

      const designData = await designRes.json();
      const [residencesData, roomsData, themesData] = await Promise.all([
        residencesRes.json(),
        roomsRes.json(),
        themesRes.json(),
      ]);

      setResidences(residencesData.residenceTypes);
      setRooms(roomsData.roomTypes);
      setThemes(themesData.themes);

      // Extract the first combination (if exists)
      const combination =
        designData.combinations && designData.combinations.length > 0
          ? designData.combinations[0]
          : { residenceType: "", roomType: "", theme: "" };

      // Populate the form with existing data
      setFormData({
        name: designData.name || "",
        description: designData.description || "",
        coohomUrl: designData.coohomUrl || "",
        thumbnail: null,
        thumbnailBase64: "", // We don't need the base64 for existing image
        thumbnailPreview: designData.thumbnailUrl || "", // Use the URL from API
        residenceType: combination.residenceType || "",
        roomType: combination.roomType || "",
        theme: combination.theme || "",
      });
    } catch (err: any) {
      setApiError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (designId) {
      fetchData();
    } else {
      setApiError("Design ID is missing");
      setLoading(false);
    }
  }, [designId]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      setApiError("Please fix the validation errors");
      return;
    }

    try {
      const designPayload: any = {
        name: formData.name,
        description: formData.description,
        coohomUrl: formData.coohomUrl,
        combinations: [
          {
            residenceType: formData.residenceType,
            roomType: formData.roomType,
            theme: formData.theme,
          },
        ],
      };

      // Only include thumbnail if a new one was uploaded
      if (formData.thumbnailBase64) {
        designPayload.thumbnail = formData.thumbnailBase64;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(designPayload),
        }
      );

      const responseBody = await res.json();

      if (!res.ok) {
        console.error("API error response:", responseBody);
        throw new Error(responseBody.message || "Failed to update design");
      }

      setSuccess(true);
      setApiError("");

      alert("Design type updated successfully!");
      window.location.href = "/admin/home-catalog/design";
    } catch (err: any) {
      setApiError(err.message || "Unexpected error occurred");
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Design Type
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
        label="Coohom URL"
        name="coohomUrl"
        fullWidth
        sx={{ mb: 3 }}
        value={formData.coohomUrl}
        onChange={handleInputChange}
        error={!!errors.coohomUrl}
        helperText={errors.coohomUrl}
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
            {formData.thumbnailPreview
              ? "Change Thumbnail"
              : "Upload Thumbnail"}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            />
          </Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            {formData.thumbnail?.name ||
              (formData.thumbnailPreview
                ? "Using existing image"
                : "No file selected")}
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

        {errors.thumbnail && (
          <FormHelperText error>{errors.thumbnail}</FormHelperText>
        )}
        <FormHelperText>
          Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
        </FormHelperText>
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
              {residences.map((res: any) => (
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
              {rooms.map((room: any) => (
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
              {Array.isArray(themes) &&
                themes.map((theme: any) => (
                  <MenuItem key={theme._id} value={theme._id}>
                    {theme.name}
                  </MenuItem>
                ))}
            </Select>
            {errors.theme && <FormHelperText>{errors.theme}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>

      {apiError && (
        <Typography sx={{ mt: 2, color: "error.main" }}>{apiError}</Typography>
      )}

      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit}>Update</ReusableButton>
        <CancelButton href="/admin/home-catalog/design">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditDesignType;
