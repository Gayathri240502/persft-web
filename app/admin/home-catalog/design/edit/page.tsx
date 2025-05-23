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
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coohomUrl: "",
    thumbnail: null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    combinations: [],
  });

  const [errors, setErrors] = useState({
    name: "",
    coohomUrl: "",
  });

  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const urlRegex =
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxFileSize = 60 * 1024; // 60kb

  const validateForm = () => {
    const newErrors = { name: "", coohomUrl: "" };
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

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve({
            fullUrl: reader.result,
            base64: reader.result.split(",")[1],
          });
        } else reject("Failed to convert file");
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedFileTypes.includes(file.type) || file.size > maxFileSize)
      return;

    try {
      const { fullUrl, base64 } = await fileToBase64(file);
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailBase64: base64,
        thumbnailPreview: fullUrl,
      }));
    } catch {
      // silently fail
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailBase64: "",
      thumbnailPreview: "",
    }));
  };

  const handleCombinationChange = (index, field, value) => {
    const updated = [...formData.combinations];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, combinations: updated }));
  };

  const addCombination = () => {
    setFormData((prev) => ({
      ...prev,
      combinations: [
        ...prev.combinations,
        { residenceType: "", roomType: "", theme: "" },
      ],
    }));
  };

  const removeCombination = (index) => {
    const updated = formData.combinations.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, combinations: updated }));
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

      setFormData({
        name: designData.name || "",
        description: designData.description || "",
        coohomUrl: designData.coohomUrl || "",
        thumbnail: null,
        thumbnailBase64: "",
        thumbnailPreview: designData.thumbnailUrl || "",
        combinations: designData.combinations.map((c) => ({
          residenceType: c.residenceType?._id || "",
          roomType: c.roomType?._id || "",
          theme: c.theme?._id || "",
        })),
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
        combinations: formData.combinations,
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
    } catch {
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
              borderColor: "#05344c",
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

      <Typography variant="h6" sx={{ mb: 2 }}>
        Design Combinations
      </Typography>

      {formData.combinations.map((comb, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Residence Type</InputLabel>
              <Select
                value={comb.residenceType}
                onChange={(e) =>
                  handleCombinationChange(
                    index,
                    "residenceType",
                    e.target.value
                  )
                }
              >
                {residences.map((res) => (
                  <MenuItem key={res._id} value={res._id}>
                    {res.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={comb.roomType}
                onChange={(e) =>
                  handleCombinationChange(index, "roomType", e.target.value)
                }
              >
                {rooms.map((room) => (
                  <MenuItem key={room._id} value={room._id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={10} md={3}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={comb.theme}
                onChange={(e) =>
                  handleCombinationChange(index, "theme", e.target.value)
                }
              >
                {themes.map((theme) => (
                  <MenuItem key={theme._id} value={theme._id}>
                    {theme.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2} md={1}>
            <IconButton
              onClick={() => removeCombination(index)}
              color="error"
              sx={{ mt: 2 }}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button variant="outlined" onClick={addCombination} sx={{ mb: 3 }}>
        Add Combination
      </Button>

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
