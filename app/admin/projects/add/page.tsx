"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

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
  const { token } = getTokenAndRole();

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
  const [selectedFileName, setSelectedFileName] =
    useState<string>("No file selected");
  const [thumbnail, setThumbnail] = useState<string>("");

  useEffect(() => {
    const fetchSelectionOptions = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/selection-options/hierarchy`,
          { headers }
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

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setThumbnail(base64String);
      };
      reader.readAsDataURL(file);
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

  const handleResidenceSelection = (residenceId: string) => {
    setFormData((prev) => {
      const existingIndex = prev.selections.findIndex(
        (s) => s.residenceType === residenceId
      );

      if (existingIndex >= 0) {
        // Remove the selection if it exists
        const newSelections = [...prev.selections];
        newSelections.splice(existingIndex, 1);
        return { ...prev, selections: newSelections };
      } else {
        // Add new selection with empty sub-selections
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
      const selectionIndex = newSelections.findIndex(
        (s) => s.residenceType === residenceId
      );

      if (selectionIndex >= 0) {
        // Toggle room selection (only one room per residence)
        newSelections[selectionIndex] = {
          ...newSelections[selectionIndex],
          roomType:
            newSelections[selectionIndex].roomType === roomId ? "" : roomId,
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
      const selectionIndex = newSelections.findIndex(
        (s) => s.residenceType === residenceId && s.roomType === roomId
      );

      if (selectionIndex >= 0) {
        // Toggle theme selection (only one theme per room)
        newSelections[selectionIndex] = {
          ...newSelections[selectionIndex],
          theme: newSelections[selectionIndex].theme === themeId ? "" : themeId,
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
      const selectionIndex = newSelections.findIndex(
        (s) =>
          s.residenceType === residenceId &&
          s.roomType === roomId &&
          s.theme === themeId
      );

      if (selectionIndex >= 0) {
        // Toggle design selection (only one design per theme)
        newSelections[selectionIndex] = {
          ...newSelections[selectionIndex],
          design:
            newSelections[selectionIndex].design === designId ? "" : designId,
        };
      }

      return { ...prev, selections: newSelections };
    });
  };

  const isResidenceSelected = (residenceId: string) => {
    return formData.selections.some((s) => s.residenceType === residenceId);
  };

  const isRoomSelected = (residenceId: string, roomId: string) => {
    const selection = formData.selections.find(
      (s) => s.residenceType === residenceId
    );
    return selection ? selection.roomType === roomId : false;
  };

  const isThemeSelected = (
    residenceId: string,
    roomId: string,
    themeId: string
  ) => {
    const selection = formData.selections.find(
      (s) => s.residenceType === residenceId && s.roomType === roomId
    );
    return selection ? selection.theme === themeId : false;
  };

  const isDesignSelected = (
    residenceId: string,
    roomId: string,
    themeId: string,
    designId: string
  ) => {
    const selection = formData.selections.find(
      (s) =>
        s.residenceType === residenceId &&
        s.roomType === roomId &&
        s.theme === themeId
    );
    return selection ? selection.design === designId : false;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.thumbnail) {
      newErrors.thumbnail = "Thumbnail is required";
    }

    if (formData.selections.length === 0) {
      newErrors.selections = "Select at least one residence";
    } else {
      const incompleteSelections = formData.selections.filter(
        (selection) =>
          !selection.roomType || !selection.theme || !selection.design
      );

      if (incompleteSelections.length > 0) {
        newErrors.selections =
          "Complete all selections (residence → room → theme → design) for each selected residence";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

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
      setFormData({
        name: "",
        description: "",
        thumbnail: null,
        thumbnailBase64: "",
        thumbnailPreview: "",
        selections: [],
      });
    } catch (error) {
      console.error("Submit error:", error);
      setApiError("Something went wrong while submitting the form.");
    }
  };

  return (
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
          sx={{
            color: "#05344c",
            borderColor: "#05344c",
            "&:hover": { backgroundColor: "#f0f4f8" },
          }}
        >
          Upload Thumbnail
          <input type="file" hidden onChange={handleThumbnailChange} />
        </Button>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {selectedFileName}
        </Typography>
      </Box>

      {/* Help Text */}
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

      <Typography variant="h6" sx={{ mb: 2 }}>
        Selections
      </Typography>

      {selectionOptions.map((residence) => (
        <Box
          key={residence.id}
          sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 2 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={isResidenceSelected(residence.id)}
                onChange={() => handleResidenceSelection(residence.id)}
              />
            }
            label={residence.name}
          />

          {isResidenceSelected(residence.id) && (
            <Box sx={{ ml: 3 }}>
              {residence.roomTypes?.map((room) => (
                <Box key={room.id} sx={{ mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRoomSelected(residence.id, room.id)}
                        onChange={() =>
                          handleRoomSelection(residence.id, room.id)
                        }
                      />
                    }
                    label={room.name}
                  />

                  {isRoomSelected(residence.id, room.id) && (
                    <Box sx={{ ml: 3 }}>
                      {room.themes?.map((theme) => (
                        <Box key={theme.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isThemeSelected(
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

                          {isThemeSelected(residence.id, room.id, theme.id) && (
                            <Box sx={{ ml: 3 }}>
                              {theme.designs?.map((design) => (
                                <FormControlLabel
                                  key={design.id}
                                  control={
                                    <Checkbox
                                      checked={isDesignSelected(
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
  );
};

export default CreateProject;
