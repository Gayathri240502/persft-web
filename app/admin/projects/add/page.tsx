"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";

interface SelectionOption {
  id: string;
  name: string;
  roomTypes?: {
    id: string;
    name: string;
    themes?: {
      id: string;
      name: string;
      designs?: { id: string; name: string }[];
    }[];
  }[];
}

interface FormData {
  name: string;
  description: string;
  thumbnail: File | null;
  thumbnailBase64: string;
  thumbnailPreview: string;
  combinations: {
    residenceType: string;
    roomType: string;
    theme: string;
    design: string;
  }[];
}

const CreateProject = () => {
  const { token } = useTokenAndRole();
  const router = useRouter();

  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>(
    []
  );
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    thumbnail: null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    combinations: [{ residenceType: "", roomType: "", theme: "", design: "" }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch hierarchical data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/selection-options/hierarchy`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch selection options");
        const data = await res.json();

        // Deduplicate themes and designs
        const cleaned = data.map((res: SelectionOption) => ({
          ...res,
          roomTypes: res.roomTypes?.map((room) => ({
            ...room,
            themes: room.themes
              ? Array.from(
                  new Map(room.themes.map((t) => [t.id, t])).values()
                ).map((theme) => ({
                  ...theme,
                  designs: theme.designs
                    ? Array.from(
                        new Map(theme.designs.map((d) => [d.id, d])).values()
                      )
                    : [],
                }))
              : [],
          })),
        }));

        setSelectionOptions(cleaned);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Thumbnail upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 60 * 1024; // 60 KB
    if (file.size > maxSize) {
      alert("File size exceeds 60KB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1]; // Only Base64 part
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailBase64: base64,
          thumbnailPreview: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailBase64: "",
      thumbnailPreview: "",
    }));
  };

  const getThumbnailDisplayName = () =>
    formData.thumbnail?.name || "No file selected";
  const hasAnyThumbnail = () => !!formData.thumbnailPreview;

  // Combination handlers
  const addCombination = () => {
    setFormData((prev) => ({
      ...prev,
      combinations: [
        ...prev.combinations,
        { residenceType: "", roomType: "", theme: "", design: "" },
      ],
    }));
  };

  const removeCombination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      combinations: prev.combinations.filter((_, i) => i !== index),
    }));
  };

  const handleCombinationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newCombos = [...formData.combinations];
    newCombos[index] = { ...newCombos[index], [field]: value };
    if (field === "residenceType") {
      newCombos[index].roomType = "";
      newCombos[index].theme = "";
      newCombos[index].design = "";
    } else if (field === "roomType") {
      newCombos[index].theme = "";
      newCombos[index].design = "";
    } else if (field === "theme") {
      newCombos[index].design = "";
    }
    setFormData((prev) => ({ ...prev, combinations: newCombos }));
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    formData.combinations.forEach((combo) => {
      if (
        !combo.residenceType ||
        !combo.roomType ||
        !combo.theme ||
        !combo.design
      ) {
        newErrors.combinations = "Complete all selections in each combination";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        selections: formData.combinations,
      };

      if (formData.thumbnailBase64) {
        payload.thumbnail = formData.thumbnailBase64; // Only Base64 string
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to create project");

      alert("Project created successfully!");
      router.push("/admin/projects");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar label="Create Project" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create Project
        </Typography>

        {/* Name & Description */}
        <TextField
          label="Name"
          name="name"
          fullWidth
          sx={{ mb: 3 }}
          value={formData.name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
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

        {/* Thumbnail Upload */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              {hasAnyThumbnail() ? "Update Thumbnail" : "Upload Thumbnail"}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
              />
            </Button>
            <Typography variant="body2">{getThumbnailDisplayName()}</Typography>
            {hasAnyThumbnail() && (
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
          {hasAnyThumbnail() && (
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

        {/* Design Combinations */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Design Combinations
        </Typography>
        {errors.combinations && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.combinations}
          </Alert>
        )}

        {formData.combinations.map((combo, idx) => {
          const selectedResidence = selectionOptions.find(
            (r) => r.id === combo.residenceType
          );
          const selectedRoomType = selectedResidence?.roomTypes?.find(
            (r) => r.id === combo.roomType
          );
          const selectedTheme = selectedRoomType?.themes?.find(
            (t) => t.id === combo.theme
          );

          return (
            <Box
              key={idx}
              sx={{
                mb: 3,
                p: 3,
                border: "1px solid #eee",
                borderRadius: 1,
                position: "relative",
              }}
            >
              {formData.combinations.length > 1 && (
                <IconButton
                  onClick={() => removeCombination(idx)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "error.main",
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel required>Residence Type</InputLabel>
                    <Select
                      value={combo.residenceType}
                      onChange={(e) =>
                        handleCombinationChange(
                          idx,
                          "residenceType",
                          e.target.value
                        )
                      }
                    >
                      {selectionOptions.map((res) => (
                        <MenuItem key={res.id} value={res.id}>
                          {res.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel required>Room Type</InputLabel>
                    <Select
                      value={combo.roomType}
                      onChange={(e) =>
                        handleCombinationChange(idx, "roomType", e.target.value)
                      }
                      disabled={!combo.residenceType}
                    >
                      {selectedResidence?.roomTypes?.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel required>Theme</InputLabel>
                    <Select
                      value={combo.theme}
                      onChange={(e) =>
                        handleCombinationChange(idx, "theme", e.target.value)
                      }
                      disabled={!combo.roomType}
                    >
                      {selectedRoomType?.themes?.map((theme) => (
                        <MenuItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel required>Design</InputLabel>
                    <Select
                      value={combo.design}
                      onChange={(e) =>
                        handleCombinationChange(idx, "design", e.target.value)
                      }
                      disabled={!combo.theme}
                    >
                      {selectedTheme?.designs?.map((design) => (
                        <MenuItem key={design.id} value={design.id}>
                          {design.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          );
        })}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            onClick={addCombination}
            sx={{ textTransform: "none" }}
          >
            Add Another Combination
          </Button>
        </Box>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </ReusableButton>
          <CancelButton href="/admin/projects">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default CreateProject;
