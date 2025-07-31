"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
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
      designs?: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

interface FormData {
  name: string;
  description: string;
  thumbnail: File | null;
  thumbnailBase64: string;
  thumbnailPreview: string;
  selections: {
    residenceType: string;
    roomType: string;
    theme: string;
    design: string;
  }[];
}

const CreateProject = () => {
  const { token } = useTokenAndRole();

  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>(
    []
  );
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    thumbnail: null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    selections: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const router = useRouter();

  useEffect(() => {
    const fetchSelectionOptions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/selection-options/hierarchy`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch selection options");
        }

        const data = await response.json();
        setSelectionOptions(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchSelectionOptions();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;

        // Strip the data URL prefix to get only base64 string
        const base64String = result.split(",")[1];

        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailBase64: base64String, // now it's just base64
          thumbnailPreview: result, // still use full string for image preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResidenceSelection = (residenceId: string) => {
    setFormData((prev) => {
      const existingIndex = prev.selections.findIndex(
        (s) => s.residenceType === residenceId
      );

      if (existingIndex >= 0) {
        const newSelections = [...prev.selections];
        newSelections.splice(existingIndex, 1);
        return { ...prev, selections: newSelections };
      } else {
        return {
          ...prev,
          selections: [
            ...prev.selections,
            {
              residenceType: residenceId,
              roomType: "",
              theme: "",
              design: "",
            },
          ],
        };
      }
    });
  };

  const handleRoomSelection = (residenceId: string, roomId: string) => {
    setFormData((prev) => {
      const newSelections = [...prev.selections];
      const index = newSelections.findIndex(
        (s) => s.residenceType === residenceId
      );
      if (index >= 0) {
        newSelections[index] = {
          ...newSelections[index],
          roomType: newSelections[index].roomType === roomId ? "" : roomId,
          theme: "",
          design: "",
        };
      }
      return { ...prev, selections: newSelections };
    });
  };

  const handleThemeSelection = (
    residenceId: string,
    roomId: string,
    themeId: string
  ) => {
    setFormData((prev) => {
      const newSelections = [...prev.selections];
      const index = newSelections.findIndex(
        (s) => s.residenceType === residenceId && s.roomType === roomId
      );
      if (index >= 0) {
        newSelections[index] = {
          ...newSelections[index],
          theme: newSelections[index].theme === themeId ? "" : themeId,
          design: "",
        };
      }
      return { ...prev, selections: newSelections };
    });
  };

  const handleDesignSelection = (
    residenceId: string,
    roomId: string,
    themeId: string,
    designId: string
  ) => {
    setFormData((prev) => {
      const newSelections = [...prev.selections];
      const index = newSelections.findIndex(
        (s) =>
          s.residenceType === residenceId &&
          s.roomType === roomId &&
          s.theme === themeId
      );
      if (index >= 0) {
        newSelections[index] = {
          ...newSelections[index],
          design: newSelections[index].design === designId ? "" : designId,
        };
      }
      return { ...prev, selections: newSelections };
    });
  };

  const isSelected = {
    residence: (residenceId: string) =>
      formData.selections.some((s) => s.residenceType === residenceId),

    room: (residenceId: string, roomId: string) => {
      const sel = formData.selections.find(
        (s) => s.residenceType === residenceId
      );
      return sel?.roomType === roomId;
    },

    theme: (residenceId: string, roomId: string, themeId: string) => {
      const sel = formData.selections.find(
        (s) => s.residenceType === residenceId && s.roomType === roomId
      );
      return sel?.theme === themeId;
    },

    design: (
      residenceId: string,
      roomId: string,
      themeId: string,
      designId: string
    ) => {
      const sel = formData.selections.find(
        (s) =>
          s.residenceType === residenceId &&
          s.roomType === roomId &&
          s.theme === themeId
      );
      return sel?.design === designId;
    },
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    // if (!formData.thumbnailBase64) {
    //   newErrors.thumbnail = "Thumbnail is required";
    // }

    if (formData.selections.length === 0) {
      newErrors.selections = "Select at least one residence";
    } else {
      const incomplete = formData.selections.some(
        (s) => !s.roomType || !s.theme || !s.design
      );
      if (incomplete) {
        newErrors.selections =
          "Complete all selections (residence → room → theme → design)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        thumbnail: formData.thumbnailBase64,
        selections: formData.selections,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to create project");

      alert("Project created successfully!");
      router.push("/admin/projects"); // Redirect to projects list
      setFormData({
        name: "",
        description: "",
        thumbnail: null,
        thumbnailBase64: "",
        thumbnailPreview: "",
        selections: [],
      });
      setSelectedFileName("No file selected");
      setErrors({});
      setApiError(null);
    } catch (error: any) {
      console.error("Submit error:", error);
      setApiError(
        error.message || "Something went wrong while submitting the form."
      );
    }
  };

  return (
    <>
      <Navbar label="Create Project" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create Project
        </Typography>

        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          fullWidth
          required
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
          >
            Upload Thumbnail
            <input type="file" hidden onChange={handleThumbnailChange} />
          </Button>
          <Typography variant="body2">{selectedFileName}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#999" }}>
          Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
        </Typography>
        {formData.thumbnailPreview && (
          <Box sx={{ mt: 2 }}>
            <img
              src={formData.thumbnailPreview}
              alt="Thumbnail Preview"
              style={{ width: 200, borderRadius: 8 }}
            />
          </Box>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Selections
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
          Select Residence Types
        </Typography>

        {selectionOptions.map((residence) => (
          <Box
            key={residence.id}
            sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 2 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected.residence(residence.id)}
                  onChange={() => handleResidenceSelection(residence.id)}
                />
              }
              label={residence.name}
            />

            {isSelected.residence(residence.id) && (
              <Box sx={{ ml: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Select Room Types
                </Typography>

                {residence.roomTypes?.map((room) => (
                  <Box key={room.id} sx={{ mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected.room(residence.id, room.id)}
                          onChange={() =>
                            handleRoomSelection(residence.id, room.id)
                          }
                        />
                      }
                      label={room.name}
                    />

                    {isSelected.room(residence.id, room.id) && (
                      <Box sx={{ ml: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: "bold" }}
                        >
                          Select Themes
                        </Typography>

                        {room.themes?.map((theme) => (
                          <Box key={theme.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelected.theme(
                                    residence.id,
                                    room.id,
                                    theme.id
                                  )}
                                  onChange={() =>
                                    handleThemeSelection(
                                      residence.id,
                                      room.id,
                                      theme.id
                                    )
                                  }
                                />
                              }
                              label={theme.name}
                            />

                            {isSelected.theme(
                              residence.id,
                              room.id,
                              theme.id
                            ) && (
                              <Box sx={{ ml: 3 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ mb: 1, fontWeight: "bold" }}
                                >
                                  Select Designs
                                </Typography>

                                {theme.designs?.map((design) => (
                                  <FormControlLabel
                                    key={design.id}
                                    control={
                                      <Checkbox
                                        checked={isSelected.design(
                                          residence.id,
                                          room.id,
                                          theme.id,
                                          design.id
                                        )}
                                        onChange={() =>
                                          handleDesignSelection(
                                            residence.id,
                                            room.id,
                                            theme.id,
                                            design.id
                                          )
                                        }
                                      />
                                    }
                                    label={design.name}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}

        {errors.selections && (
          <Typography color="error">{errors.selections}</Typography>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <ReusableButton onClick={handleSubmit}>Submit</ReusableButton>
          <CancelButton href="/admin/projects">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default CreateProject;
