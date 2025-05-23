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
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useSearchParams, useRouter } from "next/navigation";

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
    originalId?: string;
  }[];
}

// Define the interface for the selection data from the API
interface ProjectSelection {
  _id?: string;
  residenceType?: string;
  roomType?: string;
  theme?: string;
  design?: string;
  [key: string]: any; // Allow for other properties
}

// Define the interface for project data from the API
interface ProjectData {
  name: string;
  description: string;
  thumbnailUrl?: string;
  selections: ProjectSelection[];
  [key: string]: any; // Allow for other properties
}

const EditProject = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { token } = getTokenAndRole();

  console.log("Project ID:", id);

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
  const [originalThumbnail, setOriginalThumbnail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch selection options
        const optionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/selection-options/hierarchy`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!optionsResponse.ok) {
          throw new Error("Failed to fetch selection options");
        }

        const optionsData = await optionsResponse.json();
        setSelectionOptions(optionsData);
        console.log("Selection options:", optionsData);

        // Fetch project data
        const projectResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project data");
        }

        const projectData: ProjectData = await projectResponse.json();
        console.log("Project data received:", projectData);

        // Handle the case where we need to fetch detailed selection data
        // The project data only contains selection IDs, so we need to fetch the actual selection details
        let processedSelections: {
          residenceType: string;
          roomType: string;
          theme: string;
          design: string;
          originalId?: string;
        }[] = [];

        // Check if selections exist and have the expected structure
        if (projectData.selections && Array.isArray(projectData.selections)) {
          // If selections exist but don't have our expected fields, we need to fetch the detailed data
          // This is just a placeholder - your API might have a different endpoint to fetch detailed selection data
          try {
            // For now, we'll just create empty selection objects
            // In a real scenario, you would fetch the actual selection details from your API
            processedSelections = projectData.selections.map(
              (selection: ProjectSelection) => ({
                residenceType: selection.residenceType || "",
                roomType: selection.roomType || "",
                theme: selection.theme || "",
                design: selection.design || "",
                // Store the original selection ID in case we need it
                originalId: selection._id || "",
              })
            );
          } catch (err) {
            console.error("Error processing selections:", err);
          }
        }

        // Convert project data to our form format
        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          thumbnail: null,
          thumbnailBase64: "",
          thumbnailPreview: projectData.thumbnailUrl || "",
          selections: processedSelections,
        });

        setOriginalThumbnail(projectData.thumbnailUrl || "");
      } catch (err) {
        console.error("Fetch error:", err);
        setApiError("Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

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
        const base64String = result.split(",")[1];
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailBase64: base64String,
          thumbnailPreview: result,
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

    // In this case, we don't require thumbnail for existing projects
    // if (!formData.thumbnailBase64 && !formData.thumbnailPreview) {
    //   newErrors.thumbnail = "Thumbnail is required";
    // }

    // Add an info alert if there are no selections instead of an error
    if (formData.selections.length === 0) {
      console.warn("No selections defined for this project.");
      // newErrors.selections = "Select at least one residence";
      // Comment out the error to allow saving without selections
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // Format the selections properly for the API
      const formattedSelections = formData.selections.map((sel) => {
        // If we have an originalId, include it in the payload
        const selectionData: ProjectSelection = {
          residenceType: sel.residenceType,
          roomType: sel.roomType,
          theme: sel.theme,
          design: sel.design,
        };

        if (sel.originalId) {
          selectionData._id = sel.originalId;
        }

        return selectionData;
      });

      const payload = {
        name: formData.name,
        description: formData.description,
        thumbnail: formData.thumbnailBase64 || "",
        selections: formattedSelections,
      };

      console.log("Submitting payload:", payload);

      // Changed from PUT to PATCH to match API expectations
      const response = await fetch(
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

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Failed to update project (${response.status})`
        );
      }

      console.log("Update successful:", result);
      alert("Project updated successfully!");
      router.push("/admin/projects");
    } catch (error: any) {
      console.error("Submit error:", error);
      setApiError(
        error.message || "Something went wrong while updating the project."
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading project data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Project
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
        <Typography variant="body2">
          {formData.thumbnail ? selectedFileName : "Using existing thumbnail"}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: "#999" }}>
        Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
      </Typography>
      {(formData.thumbnailPreview || originalThumbnail) && (
        <Box sx={{ mt: 2 }}>
          <img
            src={formData.thumbnailPreview || originalThumbnail}
            alt="Thumbnail Preview"
            style={{ width: 200, borderRadius: 8 }}
          />
        </Box>
      )}
      {errors.thumbnail && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.thumbnail}
        </Typography>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
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
                checked={isSelected.residence(residence.id)}
                onChange={() => handleResidenceSelection(residence.id)}
              />
            }
            label={residence.name}
          />

          {isSelected.residence(residence.id) && (
            <Box sx={{ ml: 3 }}>
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
        <ReusableButton onClick={handleSubmit}>Update</ReusableButton>
        <CancelButton href="/admin/projects">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditProject;
