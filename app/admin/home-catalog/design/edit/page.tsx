"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import { useSearchParams, useRouter } from "next/navigation";

type FormDataType = {
  name: string;
  description: string;
  coohomUrl: string;
  thumbnail: File | null; // <-- changed here
  thumbnailBase64: string;
  thumbnailPreview: string;
  residenceType: string;
  roomType: string;
  theme: string;
};

const EditDesignType = () => {
  const { token } = getTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");
  const router = useRouter();

  const [residences, setResidences] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    coohomUrl: "",
    thumbnail: null,
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

  const urlRegex =
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxFileSize = 60 * 1024; // 60kb

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name should not be empty";
      isValid = false;
    }

    if (!formData.coohomUrl.trim()) {
      newErrors.coohomUrl = "Coohom URL should not be empty";
      isValid = false;
    } else if (!urlRegex.test(formData.coohomUrl)) {
      newErrors.coohomUrl = "Coohom URL must be a valid URL";
      isValid = false;
    }

    if (!mongoIdRegex.test(formData.residenceType)) {
      newErrors.residenceType = "Select valid residence type";
      isValid = false;
    }

    if (!mongoIdRegex.test(formData.roomType)) {
      newErrors.roomType = "Select valid room type";
      isValid = false;
    }

    if (!mongoIdRegex.test(formData.theme)) {
      newErrors.theme = "Select valid theme";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Convert base64 string to displayable image URL
  const convertBase64ToImageUrl = (base64String: string) => {
    if (!base64String) return "";

    // If it's already a data URL, return as is
    if (base64String.startsWith("data:image/")) {
      return base64String;
    }

    // If it's just the base64 part, add the data URL prefix
    // Assume JPEG format if not specified (you can modify this based on your needs)
    return `data:image/jpeg;base64,${base64String}`;
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: "Invalid file type. Please upload JPG, JPEG, or PNG.",
      }));
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: "File size exceeds 60KB limit.",
      }));
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64Result = reader.result as string;

        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailBase64: base64Result,
          thumbnailPreview: base64Result,
        }));

        // Clear any previous errors
        setErrors((prev) => ({ ...prev, thumbnail: "" }));
      };

      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Failed to process image. Please try again.",
        }));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: "Failed to process image. Please try again.",
      }));
    }
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [designRes, resRes, roomRes, themeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes`, { headers }),
      ]);

      const designData = await designRes.json();
      const residencesData = await resRes.json();
      const roomsData = await roomRes.json();
      const themesData = await themeRes.json();

      const combination = designData.combinations?.[0] || {};

      // Convert backend base64 to displayable format
      const thumbnailPreview = designData.thumbnail
        ? convertBase64ToImageUrl(designData.thumbnail)
        : designData.thumbnailUrl || "";

      setFormData({
        name: designData.name || "",
        description: designData.description || "",
        coohomUrl: designData.coohomUrl || "",
        thumbnail: null,
        thumbnailBase64: designData.thumbnail || "",
        thumbnailPreview: thumbnailPreview,
        residenceType: combination.residenceType?._id || "",
        roomType: combination.roomType?._id || "",
        theme: combination.theme?._id || "",
      });

      setResidences(residencesData.residenceTypes);
      setRooms(roomsData.roomTypes);
      setThemes(themesData.themes);
    } catch (err) {
      setApiError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (designId) fetchData();
  }, [designId]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
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
        ...(formData.thumbnailBase64 && {
          thumbnail: formData.thumbnailBase64,
        }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update design");
      setSuccess(true);
      router.push("/admin/home-catalog/design");
    } catch (err) {
      setApiError("Failed to submit form");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Navbar label="Design Types" />
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

        {/* Thumbnail Upload Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
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
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleThumbnailChange}
              />
            </Button>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {formData.thumbnail
                ? formData.thumbnail.name
                : "No new file selected"}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: "#999", display: "block", mb: 2 }}
          >
            Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
          </Typography>

          {errors.thumbnail && (
            <Typography
              variant="caption"
              sx={{ color: "error.main", display: "block", mb: 2 }}
            >
              {errors.thumbnail}
            </Typography>
          )}

          {/* Thumbnail Preview */}
          {formData.thumbnailPreview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Current Thumbnail:
              </Typography>
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail Preview"
                style={{
                  width: 200,
                  height: "auto",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  console.error("Error loading thumbnail preview");
                  // You can set a fallback image here if needed
                }}
              />
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
          <Typography sx={{ mt: 2, color: "error.main" }}>
            {apiError}
          </Typography>
        )}

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit}>Update</ReusableButton>
          <CancelButton href="/admin/home-catalog/design">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default EditDesignType;
