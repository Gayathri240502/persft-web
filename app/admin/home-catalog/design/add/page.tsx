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
  IconButton,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Combination {
  residenceType: string;
  roomType: string;
  theme: string;
}

interface FormData {
  name: string;
  description: string;
  coohomUrl: string;
  thumbnail: File | null;
  thumbnailBase64: string;
  thumbnailPreview: string;
  combinations: Combination[];
}

const AddDesignType = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [residences, setResidences] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingThumbnail, setExistingThumbnail] = useState<string>(""); // Track existing thumbnail from backend

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    coohomUrl: "",
    thumbnail: null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    combinations: [
      {
        residenceType: "",
        roomType: "",
        theme: "",
      },
    ],
  });

  const [errors, setErrors] = useState({
    name: "",
    coohomUrl: "",
    residenceType: "",
    roomType: "",
    theme: "",
    thumbnail: "",
    combinations: "",
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

  // Helper function to convert base64 to data URL if it's not already
  const formatBase64ForDisplay = (base64String: string): string => {
    if (base64String.startsWith("data:image/")) {
      return base64String;
    }
    // Assume it's a JPEG if no type specified
    return `data:image/jpeg;base64,${base64String}`;
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      coohomUrl: "",
      residenceType: "",
      roomType: "",
      theme: "",
      thumbnail: "",
      combinations: "",
    };

    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Coohom URL validation
    if (!formData.coohomUrl.trim()) {
      newErrors.coohomUrl = "Coohom URL is required";
      isValid = false;
    } else if (!urlRegex.test(formData.coohomUrl)) {
      newErrors.coohomUrl = "Invalid URL format";
      isValid = false;
    }

    // Thumbnail validation
    // if (!formData.thumbnail || !formData.thumbnailBase64) {
    //   newErrors.thumbnail = "Thumbnail is required";
    //   isValid = false;
    // }

    // Combinations validation
    if (formData.combinations.length === 0) {
      newErrors.combinations = "At least one combination is required";
      isValid = false;
    } else {
      for (const combo of formData.combinations) {
        if (!combo.residenceType) {
          newErrors.combinations =
            "Residence Type is required for all combinations";
          isValid = false;
          break;
        }
        if (!combo.roomType) {
          newErrors.combinations = "Room Type is required for all combinations";
          isValid = false;
          break;
        }
        if (!combo.theme) {
          newErrors.combinations = "Theme is required for all combinations";
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleCombinationChange = (
    index: number,
    field: keyof Combination,
    value: string
  ) => {
    const updatedCombinations = [...formData.combinations];
    updatedCombinations[index] = {
      ...updatedCombinations[index],
      [field]: value,
    };

    // Reset dependent fields when parent changes
    if (field === "residenceType") {
      updatedCombinations[index].roomType = "";
      updatedCombinations[index].theme = "";
    } else if (field === "roomType") {
      updatedCombinations[index].theme = "";
    }

    setFormData({ ...formData, combinations: updatedCombinations });
    setErrors({ ...errors, combinations: "" });
  };

  const addCombination = () => {
    setFormData({
      ...formData,
      combinations: [
        ...formData.combinations,
        {
          residenceType: "",
          roomType: "",
          theme: "",
        },
      ],
    });
  };

  const removeCombination = (index: number) => {
    if (formData.combinations.length <= 1) {
      setErrors({
        ...errors,
        combinations: "At least one combination is required",
      });
      return;
    }

    const updatedCombinations = [...formData.combinations];
    updatedCombinations.splice(index, 1);
    setFormData({ ...formData, combinations: updatedCombinations });
    setErrors({ ...errors, combinations: "" });
  };

  const fileToBase64 = (
    file: File
  ): Promise<{ fullUrl: string; base64: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const fullDataUrl = reader.result;
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
          thumbnail: "Only JPG, JPEG, and PNG files are allowed",
        });
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        setErrors({
          ...errors,
          thumbnail: "File size exceeds 60kb limit",
        });
        return;
      }

      try {
        const { fullUrl, base64 } = await fileToBase64(file);
        setFormData({
          ...formData,
          thumbnail: file,
          thumbnailBase64: base64,
          thumbnailPreview: fullUrl,
        });
        setErrors({ ...errors, thumbnail: "" });
        // Clear existing thumbnail when new file is uploaded
        setExistingThumbnail("");
      } catch (err) {
        setErrors({
          ...errors,
          thumbnail: "Failed to process the image",
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      thumbnail: null,
      thumbnailBase64: "",
      thumbnailPreview: "",
    });
    setErrors({ ...errors, thumbnail: "" });
    // Also clear existing thumbnail
    setExistingThumbnail("");
  };

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [residencesRes, roomsRes, themesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes`, { headers }),
      ]);

      if (!residencesRes.ok || !roomsRes.ok || !themesRes.ok) {
        throw new Error("Failed to fetch dropdown data");
      }

      const [residencesData, roomsData, themesData] = await Promise.all([
        residencesRes.json(),
        roomsRes.json(),
        themesRes.json(),
      ]);

      setResidences(residencesData.residenceTypes || []);
      setRooms(roomsData.roomTypes || []);
      setThemes(themesData.themes || []);
    } catch (err: any) {
      setApiError(err.message || "Error fetching dropdown data");
    }
  };

  // Function to fetch existing design data if this is an edit page
  const fetchExistingDesign = async (designId: string) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch design data");
      }

      const designData = await response.json();

      // Set form data with existing design data
      setFormData({
        name: designData.name || "",
        description: designData.description || "",
        coohomUrl: designData.coohomUrl || "",
        thumbnail: null,
        thumbnailBase64: designData.thumbnail || "",
        thumbnailPreview: "",
        combinations: designData.combinations || [
          {
            residenceType: "",
            roomType: "",
            theme: "",
          },
        ],
      });

      // Set existing thumbnail for display
      if (designData.thumbnail) {
        setExistingThumbnail(designData.thumbnail);
      }
    } catch (err: any) {
      setApiError(err.message || "Error fetching design data");
    }
  };

  useEffect(() => {
    fetchData();
    // If you need to fetch existing design data, uncomment and use:
    // const designId = router.query.id; // or however you get the design ID
    // if (designId) {
    //   fetchExistingDesign(designId);
    // }
  }, []);

  const handleSubmit = async () => {
    if (!validateForm()) {
      setApiError("Please fix the validation errors");
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      // Prepare thumbnail with data URL prefix
      let thumbnailToSend = "";
      
      if (formData.thumbnailPreview) {
        // New thumbnail uploaded - use the full data URL (already has data:image/...;base64, prefix)
        thumbnailToSend = formData.thumbnailPreview;
      } else if (existingThumbnail) {
        // Use existing thumbnail - ensure it has the proper format
        thumbnailToSend = existingThumbnail.startsWith("data:image/") 
          ? existingThumbnail 
          : `data:image/jpeg;base64,${existingThumbnail}`;
      }

      const designPayload = {
        name: formData.name,
        description: formData.description,
        coohomUrl: formData.coohomUrl,
        thumbnail: thumbnailToSend,
        combinations: formData.combinations.map((combo) => ({
          residenceType: combo.residenceType,
          roomType: combo.roomType,
          theme: combo.theme,
        })),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(designPayload),
      });

      const responseBody = await res.json();

      if (!res.ok) {
        throw new Error(responseBody.message || "Failed to create design type");
      }

      setSuccess(true);
      alert("Design type added successfully!");
      router.push("/admin/home-catalog/design");
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the thumbnail to display - priority: new upload > existing thumbnail
  const getThumbnailForDisplay = (): string => {
    if (formData.thumbnailPreview) {
      return formData.thumbnailPreview;
    }
    if (existingThumbnail) {
      return formatBase64ForDisplay(existingThumbnail);
    }
    return "";
  };

  const hasAnyThumbnail = (): boolean => {
    return !!(formData.thumbnailPreview || existingThumbnail);
  };

  const getThumbnailDisplayName = (): string => {
    if (formData.thumbnail?.name) {
      return formData.thumbnail.name;
    }
    if (existingThumbnail) {
      return "Existing thumbnail";
    }
    return "No file selected";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Add Design Type
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
            {hasAnyThumbnail() ? "Update Thumbnail" : "Upload Thumbnail"}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            />
          </Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            {getThumbnailDisplayName()}
          </Typography>

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
                src={getThumbnailForDisplay()}
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

      <Typography variant="h6" sx={{ mb: 2 }}>
        Design Combinations
      </Typography>

      {errors.combinations && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.combinations}
        </Alert>
      )}

      {formData.combinations.map((combo, index) => (
        <Box
          key={index}
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
              onClick={() => removeCombination(index)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "error.main",
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel required>Residence Type</InputLabel>
                <Select
                  value={combo.residenceType}
                  onChange={(e) =>
                    handleCombinationChange(
                      index,
                      "residenceType",
                      e.target.value as string
                    )
                  }
                  label="Residence Type *"
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
                <InputLabel required>Room Type</InputLabel>
                <Select
                  value={combo.roomType}
                  onChange={(e) =>
                    handleCombinationChange(
                      index,
                      "roomType",
                      e.target.value as string
                    )
                  }
                  label="Room Type *"
                  disabled={!combo.residenceType}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel required>Theme</InputLabel>
                <Select
                  value={combo.theme}
                  onChange={(e) =>
                    handleCombinationChange(
                      index,
                      "theme",
                      e.target.value as string
                    )
                  }
                  label="Theme *"
                  disabled={!combo.roomType}
                >
                  {themes.map((theme) => (
                    <MenuItem key={theme._id} value={theme._id}>
                      {theme.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      ))}

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
        <CancelButton href="/admin/home-catalog/design">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddDesignType;