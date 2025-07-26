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
import ReusableButton from "@/app/components/Button"; // Assuming these are your custom components
import CancelButton from "@/app/components/CancelButton"; // Assuming these are your custom components
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";

// Interface for selection options fetched from the API (hierarchy)
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

// Interface for the form data state
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
    originalId?: string; // To store the _id of the existing selection if it came from the API
  }[];
}

// Interface for the project selection data as it comes from the API
interface ProjectSelectionFromApi {
  _id?: string;
  residenceType?: { _id: string; name: string; [key: string]: any };
  roomType?: { _id: string; name: string; [key: string]: any };
  theme?: { _id: string; name: string; [key: string]: any };
  design?: { _id: string; name: string; [key: string]: any };
  [key: string]: any; // Allow for other properties
}

// Interface for project data as it comes from the API
interface ProjectDataFromApi {
  name: string;
  description: string;
  thumbnailUrl?: string;
  selections: ProjectSelectionFromApi[];
  [key: string]: any; // Allow for other properties
}

const EditProject = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { token } = useTokenAndRole(); // Custom hook to get token and role

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
  // const [originalThumbnail, setOriginalThumbnail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState<string>("at");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch selection options (residence types, room types, themes, designs hierarchy)
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

        // Fetch project data for the given ID
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

        const projectData: ProjectDataFromApi = await projectResponse.json();
        console.log("Project data received:", projectData);

        // Process existing selections from the project data to fit the form's state
        let processedSelections: FormData["selections"] = [];

        if (projectData.selections && Array.isArray(projectData.selections)) {
          processedSelections = projectData.selections.map(
            (selection: ProjectSelectionFromApi) => ({
              // Extract the _id from nested objects for form state
              residenceType: selection.residenceType?._id || "",
              roomType: selection.roomType?._id || "",
              theme: selection.theme?._id || "",
              design: selection.design?._id || "",
              originalId: selection._id || "", // Store the original selection ID
            })
          );
        }

        // Set the form data with fetched project details
        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          thumbnail: null, // Thumbnail file is not pre-filled
          thumbnailBase64: "", // Base64 is not pre-filled
          thumbnailPreview: projectData.thumbnailUrl || "", // Use existing URL for preview
          selections: processedSelections,
        });

        setThumbnail(projectData.thumbnail || "");
        setSelectedFileName("Existing Thumbnail");

        // Store the original thumbnail URL separately
        // setOriginalThumbnail(projectData.thumbnailUrl || "");
      } catch (err) {
        console.error("Fetch error:", err);
        setApiError("Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token]); // Dependencies for useEffect

  // Handles changes to text input fields (name, description)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles thumbnail file selection and preview generation
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handles selection/deselection of a residence type
  const handleResidenceSelection = (residenceId: string) => {
    setFormData((prev) => {
      const existingIndex = prev.selections.findIndex(
        (s) => s.residenceType === residenceId
      );

      if (existingIndex >= 0) {
        // If residence is already selected, remove it and its children
        const newSelections = [...prev.selections];
        newSelections.splice(existingIndex, 1);
        return { ...prev, selections: newSelections };
      } else {
        // If residence is not selected, add a new entry
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

  // Handles selection/deselection of a room type for a given residence
  const handleRoomSelection = (residenceId: string, roomId: string) => {
    setFormData((prev) => {
      const newSelections = [...prev.selections];
      const index = newSelections.findIndex(
        (s) => s.residenceType === residenceId
      );
      if (index >= 0) {
        newSelections[index] = {
          ...newSelections[index],
          // Toggle roomType, and reset theme/design if roomType changes
          roomType: newSelections[index].roomType === roomId ? "" : roomId,
          theme: "",
          design: "",
        };
      }
      return { ...prev, selections: newSelections };
    });
  };

  // Handles selection/deselection of a theme for a given room type
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
          // Toggle theme, and reset design if theme changes
          theme: newSelections[index].theme === themeId ? "" : themeId,
          design: "",
        };
      }
      return { ...prev, selections: newSelections };
    });
  };

  // Handles selection/deselection of a design for a given theme
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
          // Toggle design
          design: newSelections[index].design === designId ? "" : designId,
        };
      }
      return { ...prev, selections: newSelections };
    });
  };

  // Helper functions to determine if a selection option is currently selected
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

  // Form validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // You can add validation for thumbnail here if it's required for new uploads.
    // For existing projects, it might not be mandatory to upload a new one.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission
  const handleSubmit = async () => {
    if (!validate()) {
      setApiError(null); // Clear previous API errors if validation fails
      return;
    }

    try {
      // Format the selections properly for the API payload
      const formattedSelections = formData.selections.map((sel) => {
        const selectionData: { [key: string]: string | undefined } = {
          residenceType: sel.residenceType,
          roomType: sel.roomType,
          theme: sel.theme,
          design: sel.design,
        };
        // Include originalId if it exists for updating existing selections
        if (sel.originalId) {
          selectionData._id = sel.originalId;
        }
        return selectionData;
      });

      const payload = {
        name: formData.name,
        description: formData.description,
        // Send base64 only if a new thumbnail is selected, otherwise an empty string
        thumbnail: formData.thumbnailBase64 || "",
        selections: formattedSelections,
      };

      console.log("Submitting payload:", payload);

      // Use PATCH method for partial updates
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

      // Check content type before parsing JSON
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
      router.push("/admin/projects"); // Redirect to projects list
    } catch (error: any) {
      console.error("Submit error:", error);
      setApiError(
        error.message || "Something went wrong while updating the project."
      );
    }
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading project data...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="projects" />
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

        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
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

        {/* Display errors related to selections if any */}
        {errors.selections && (
          <Typography color="error">{errors.selections}</Typography>
        )}

        {/* Display API-related errors */}
        {apiError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {apiError}
          </Alert>
        )}

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <ReusableButton onClick={handleSubmit}>Update</ReusableButton>
          <CancelButton href="/admin/projects">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default EditProject;
