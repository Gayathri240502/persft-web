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
import { useSearchParams, useRouter } from "next/navigation";

const EditDesignType = () => {
  const { token } = getTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");
  const router = useRouter();

  const [residences, setResidences] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [thumbnail, setThumbnail] = useState<string>("at");

  const [formData, setFormData] = useState({
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

    if (!formData.thumbnail && !formData.thumbnailPreview) {
      newErrors.thumbnail = "Please upload a thumbnail image";
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

 type FileBase64Result = {
  fullUrl: string;
  base64: string;
};

const fileToBase64 = (file: File): Promise<FileBase64Result> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve({
        fullUrl: URL.createObjectURL(file),
        base64,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

  const handleFileChange = async (e:any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedFileTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, thumbnail: "Invalid file type" }));
      return;
    }

    if (file.size > maxFileSize) {
      setErrors((prev) => ({ ...prev, thumbnail: "File size exceeds 60KB" }));
      return;
    }

    try {
      const { fullUrl, base64 } = await fileToBase64(file);
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailBase64: base64,
        thumbnailPreview: fullUrl,
      }));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
    } catch {
      setErrors((prev) => ({ ...prev, thumbnail: "Failed to process image" }));
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

      setFormData({
        name: designData.name || "",
        description: designData.description || "",
        coohomUrl: designData.coohomUrl || "",
        thumbnail: null,
        thumbnailBase64: "",
        thumbnailPreview: designData.thumbnailUrl || "",
        residenceType: combination.residenceType?._id || "",
        roomType: combination.roomType?._id || "",
        theme: combination.theme?._id || "",
      });

      setResidences(residencesData.residenceTypes);
      setRooms(roomsData.roomTypes);
      setThemes(themesData.themes);
      setThumbnail(designData.thumbnail || "");
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
      router.push("/designs");
    } catch (err) {
      setApiError("Failed to submit form");
    }
  };

  if (loading) return <CircularProgress />;

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
          {/* <Typography variant="body2" sx={{ color: "#666" }}>
            {formData.thumbnail?.name ||
              (formData.thumbnailPreview
                ? "Using existing image"
                : "No file selected")}
          </Typography> */}

          {formData.thumbnailPreview && (
            <Button
              variant="text"
              color="error"
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
