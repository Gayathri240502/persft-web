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
import { useRouter, useSearchParams } from "next/navigation";
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

interface Combination {
  residenceType: string;
  roomType: string;
  theme: string;
  design: string;
  originalId?: string;
}

interface FormData {
  name: string;
  description: string;
  thumbnail: File | null;
  thumbnailBase64: string;
  thumbnailPreview: string;
  combinations: Combination[];
}

interface ProjectSelectionFromApi {
  _id?: string;
  residenceType?: { _id: string; name: string };
  roomType?: { _id: string; name: string };
  theme?: { _id: string; name: string };
  design?: { _id: string; name: string };
}

interface ProjectDataFromApi {
  name: string;
  description: string;
  thumbnailUrl?: string;
  selections: ProjectSelectionFromApi[];
}

const EditProject = () => {
  const { token } = useTokenAndRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

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
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch options
        const optionsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/selection-options/hierarchy`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const optionsData = await optionsRes.json();
        setSelectionOptions(optionsData);

        // fetch project
        const projectRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const projectData: ProjectDataFromApi = await projectRes.json();

        const processedCombinations: Combination[] =
          projectData.selections?.map((s) => ({
            residenceType: s.residenceType?._id || "",
            roomType: s.roomType?._id || "",
            theme: s.theme?._id || "",
            design: s.design?._id || "",
            originalId: s._id,
          })) || [];

        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          thumbnail: null,
          thumbnailBase64: "",
          thumbnailPreview: projectData.thumbnailUrl || "",
          combinations:
            processedCombinations.length > 0
              ? processedCombinations
              : [{ residenceType: "", roomType: "", theme: "", design: "" }],
        });
      } catch (err) {
        console.error("Fetch error", err);
        setApiError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchData();
  }, [id, token]);

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Thumbnail upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 60 * 1024;
    if (file.size > maxSize) {
      alert("File too large (max 60KB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        setFormData((p) => ({
          ...p,
          thumbnail: file,
          thumbnailBase64: base64,
          thumbnailPreview: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () =>
    setFormData((p) => ({
      ...p,
      thumbnail: null,
      thumbnailBase64: "",
      thumbnailPreview: "",
    }));

  // Combination handlers
  const handleComboChange = (idx: number, field: string, value: string) => {
    const newCombos = [...formData.combinations];
    newCombos[idx] = { ...newCombos[idx], [field]: value };
    if (field === "residenceType") {
      newCombos[idx].roomType = "";
      newCombos[idx].theme = "";
      newCombos[idx].design = "";
    } else if (field === "roomType") {
      newCombos[idx].theme = "";
      newCombos[idx].design = "";
    } else if (field === "theme") {
      newCombos[idx].design = "";
    }
    setFormData((p) => ({ ...p, combinations: newCombos }));
  };

  const addCombo = () =>
    setFormData((p) => ({
      ...p,
      combinations: [
        ...p.combinations,
        { residenceType: "", roomType: "", theme: "", design: "" },
      ],
    }));

  const removeCombo = (idx: number) =>
    setFormData((p) => ({
      ...p,
      combinations: p.combinations.filter((_, i) => i !== idx),
    }));

  // Validation
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";

    formData.combinations.forEach((c) => {
      if (!c.residenceType || !c.roomType || !c.theme || !c.design) {
        errs.combinations = "Complete all selections";
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formatted = formData.combinations.map((c) => {
        const obj: any = {
          residenceType: c.residenceType,
          roomType: c.roomType,
          theme: c.theme,
          design: c.design,
        };
        if (c.originalId) obj._id = c.originalId;
        return obj;
      });

      const payload: any = {
        name: formData.name,
        description: formData.description,
        selections: formatted,
      };
      if (formData.thumbnailBase64) {
        payload.thumbnail = formData.thumbnailBase64;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      alert("Project updated!");
      router.push("/admin/projects");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading project...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Edit Project" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Edit Project
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

        {/* Thumbnail */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              {formData.thumbnailPreview ? "Update Thumbnail" : "Upload"}
              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
            {formData.thumbnailPreview && (
              <Button color="error" size="small" onClick={removeImage}>
                Remove
              </Button>
            )}
          </Box>
          {formData.thumbnailPreview && (
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
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </Box>
          )}
        </Box>

        {/* Combinations */}
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
          const selectedRoom = selectedResidence?.roomTypes?.find(
            (r) => r.id === combo.roomType
          );
          const selectedTheme = selectedRoom?.themes?.find(
            (t) => t.id === combo.theme
          );

          return (
            <Box
              key={idx}
              sx={{ mb: 3, p: 3, border: "1px solid #eee", borderRadius: 1 }}
            >
              {formData.combinations.length > 1 && (
                <IconButton
                  onClick={() => removeCombo(idx)}
                  sx={{ position: "absolute", right: 8, color: "error.main" }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Residence</InputLabel>
                    <Select
                      value={combo.residenceType}
                      onChange={(e) =>
                        handleComboChange(idx, "residenceType", e.target.value)
                      }
                    >
                      {selectionOptions.map((r) => (
                        <MenuItem key={`res-${r.id}`} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Room</InputLabel>
                    <Select
                      value={combo.roomType}
                      onChange={(e) =>
                        handleComboChange(idx, "roomType", e.target.value)
                      }
                      disabled={!combo.residenceType}
                    >
                      {selectedResidence?.roomTypes?.map((room) => (
                        <MenuItem
                          key={`room-${selectedResidence?.id}-${room.id}`}
                          value={room.id}
                        >
                          {room.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={combo.theme}
                      onChange={(e) =>
                        handleComboChange(idx, "theme", e.target.value)
                      }
                      disabled={!combo.roomType}
                    >
                      {selectedRoom?.themes?.map((t, themeIdx) => (
                        <MenuItem
                          key={`theme-${selectedRoom.id}-${t.id}-${themeIdx}`} // FIX: Use a unique key
                          value={t.id}
                        >
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Design</InputLabel>
                    <Select
                      value={combo.design}
                      onChange={(e) =>
                        handleComboChange(idx, "design", e.target.value)
                      }
                      disabled={!combo.theme}
                    >
                      {selectedTheme?.designs?.map((d, designIdx) => (
                        <MenuItem
                          key={`design-${selectedTheme.id}-${d.id}-${designIdx}`} // FIX: Use a unique key
                          value={d.id}
                        >
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          );
        })}

        <Box sx={{ textAlign: "right", mb: 3 }}>
          <Button variant="contained" onClick={addCombo}>
            Add Combination
          </Button>
        </Box>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </ReusableButton>
          <CancelButton href="/admin/projects">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default EditProject;
