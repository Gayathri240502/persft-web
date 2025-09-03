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
  IconButton,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface SelectionOption {
  id?: string;   // optional
  _id?: string;  // optional
  name: string;
  roomTypes?: {
    id?: string;
    _id?: string;
    name: string;
    themes?: {
      id?: string;
      _id?: string;
      name: string;
    }[];
  }[];
}


interface BudgetCategory {
  _id?: string;  // optional
  name: string;
}

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
  budgetCategory: string;
  price: string;
}

const AddDesignType = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    budgetCategory: "",
    price: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  // URL validation regex
const urlRegex = /^(https?:\/\/)([\w.-]+)(\/[\w\-./?%&=]*)?$/;
  
  // Allowed file types
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxFileSize = 60 * 1024; // 60kb

  // Fetch hierarchical data and budget categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [hierarchyRes, budgetRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/selection-tree`, {
            headers,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/budget-categories`, {
            headers,
          }),
        ]);

        if (!hierarchyRes.ok) throw new Error("Failed to fetch selection options");
        if (!budgetRes.ok) throw new Error("Failed to fetch budget categories");

        const [hierarchyData, budgetData] = await Promise.all([
          hierarchyRes.json(),
          budgetRes.json(),
        ]);

        // Handle hierarchy data - direct array from /designs/selection-tree
        setSelectionOptions(hierarchyData);

        // Handle budget categories - flexible response format
        if (Array.isArray(budgetData)) {
          setBudgetCategories(budgetData);
        } else if (budgetData.budgetCategories && Array.isArray(budgetData.budgetCategories)) {
          setBudgetCategories(budgetData.budgetCategories);
        } else if (budgetData.data && Array.isArray(budgetData.data)) {
          setBudgetCategories(budgetData.data);
        } else {
          setBudgetCategories([]);
          console.warn("Budget categories data is not in expected format:", budgetData);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setApiError(err.message || "Failed to fetch required data");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // File upload handler
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: "Only JPG, JPEG, and PNG files are allowed",
      }));
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: "File size exceeds 60KB limit",
      }));
      return;
    }

    // Convert to base64
  const reader = new FileReader();
  reader.onload = () => {
    if (reader.result) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailBase64: (reader.result as string).split(",")[1] || "",
        thumbnailPreview: reader.result as string,
      }));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
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
    setErrors((prev) => ({ ...prev, thumbnail: "" }));
  };

  // Combination handlers
  const handleCombinationChange = (
    index: number,
    field: keyof Combination,
    value: string
  ) => {
    const newCombinations = [...formData.combinations];
    newCombinations[index] = { ...newCombinations[index], [field]: value };

    // Reset dependent fields when parent changes
    if (field === "residenceType") {
      newCombinations[index].roomType = "";
      newCombinations[index].theme = "";
    } else if (field === "roomType") {
      newCombinations[index].theme = "";
    }

    setFormData((prev) => ({ ...prev, combinations: newCombinations }));
    
    // Clear combination errors
    if (errors.combinations) {
      setErrors((prev) => ({ ...prev, combinations: "" }));
    }
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

  const removeCombination = (index: number) => {
    if (formData.combinations.length <= 1) {
      setErrors((prev) => ({
        ...prev,
        combinations: "At least one combination is required",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      combinations: prev.combinations.filter((_, i) => i !== index),
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Coohom URL validation
    if (!formData.coohomUrl.trim()) {
      newErrors.coohomUrl = "Coohom URL is required";
    } else if (!urlRegex.test(formData.coohomUrl)) {
      newErrors.coohomUrl = "Invalid URL format";
    }

    // Budget Category validation
    if (!formData.budgetCategory) {
      newErrors.budgetCategory = "Budget Category is required";
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Please enter a valid positive number";
    }

    // Thumbnail validation (optional but recommended)
    if (!formData.thumbnailBase64) {
      newErrors.thumbnail = "Thumbnail is recommended";
    }

    // Combinations validation
    if (formData.combinations.length === 0) {
      newErrors.combinations = "At least one combination is required";
    } else {
      for (const combo of formData.combinations) {
        if (!combo.residenceType || !combo.roomType || !combo.theme) {
          newErrors.combinations = "Complete all selections in each combination";
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      setApiError("Please fix the validation errors above");
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || "N/A",
        coohomUrl: formData.coohomUrl.trim(),
        thumbnail: formData.thumbnailBase64,
        combinations: formData.combinations.map((combo) => ({
          residenceType: combo.residenceType,
          roomType: combo.roomType,
          theme: combo.theme,
        })),
        budgetCategory: formData.budgetCategory,
        price: Number(formData.price),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create design");
      }

      // Success - redirect to designs list
      router.push("/admin/home-catalog/design");
    } catch (err: any) {
      console.error("Submit error:", err);
      setApiError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getThumbnailDisplayName = (): string => {
    return formData.thumbnail?.name || "No file selected";
  };

  const hasAnyThumbnail = (): boolean => {
    return !!formData.thumbnailPreview;
  };

  // Get available options for dropdowns
  const getAvailableRoomTypes = (residenceTypeId: string) => {
    const residence = selectionOptions.find((r) => r.id === residenceTypeId);
    return residence?.roomTypes || [];
  };

  const getAvailableThemes = (residenceTypeId: string, roomTypeId: string) => {
    const residence = selectionOptions.find((r) => r.id === residenceTypeId);
    const roomType = residence?.roomTypes?.find((rt) => rt.id === roomTypeId);
    return roomType?.themes || [];
  };

  if (isLoading) {
    return (
      <>
        <Navbar label="Add Design Type" />
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar label="Add Design Type" />
      <Box sx={{ p: 3, maxWidth: 1650, mx: "auto" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Add New Design Type
        </Typography>

        {/* Basic Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Basic Information
          </Typography>
          
          <TextField
            label="Design Name"
            name="name"
            fullWidth
            sx={{ mb: 3 }}
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            placeholder="Enter design name"
          />

          <TextField
            label="Description"
            name="description"
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 3 }}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter design description (optional)"
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
            placeholder="https://www.coohom.com/..."
          />
        </Box>

        {/* Pricing Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pricing Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.budgetCategory}>
                <InputLabel required>Budget Category</InputLabel>
                <Select
                  value={formData.budgetCategory}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      budgetCategory: e.target.value as string,
                    }));
                    setErrors((prev) => ({ ...prev, budgetCategory: "" }));
                  }}
                  label="Budget Category *"
                >
                  {budgetCategories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.budgetCategory && (
                  <FormHelperText>{errors.budgetCategory}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Price"
                name="price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={handleInputChange}
                error={!!errors.price}
                helperText={errors.price}
                required
                inputProps={{ min: 0, step: "0.01" }}
                placeholder="0.00"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Thumbnail Upload */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Thumbnail Image
          </Typography>
          
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
            <Typography variant="body2" sx={{ color: "#666", flex: 1 }}>
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
                  width: 200,
                  height: 150,
                  border: "2px dashed #ddd",
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fafafa",
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
            <FormHelperText error sx={{ ml: 0 }}>
              {errors.thumbnail}
            </FormHelperText>
          )}
          <FormHelperText sx={{ ml: 0 }}>
            Accepted formats: JPG, JPEG, PNG. Max size: 60KB.
          </FormHelperText>
        </Box>

        {/* Design Combinations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Design Combinations
          </Typography>

          {errors.combinations && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.combinations}
            </Alert>
          )}

          {formData.combinations.map((combo, index) => {
            const availableRoomTypes = getAvailableRoomTypes(combo.residenceType);
            const availableThemes = getAvailableThemes(combo.residenceType, combo.roomType);

            return (
              <Box
                key={index}
                sx={{
                  mb: 3,
                  p: 3,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  position: "relative",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                  Combination {index + 1}
                </Typography>

                {formData.combinations.length > 1 && (
                  <IconButton
                    onClick={() => removeCombination(index)}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "error.main",
                    }}
                    title="Remove combination"
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
                        {selectionOptions.map((residence) => (
                          <MenuItem key={residence._id || residence.id} value={residence._id || residence.id}>
                            {residence.name}
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
                        {availableRoomTypes.map((room) => (
                          <MenuItem key={room._id || room.id} value={room._id || room.id}>
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
                        {availableThemes.map((theme) => (
                          <MenuItem key={theme._id || theme.id} value={theme._id || theme.id}>
                            {theme.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            );
          })}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="outlined"
              onClick={addCombination}
              sx={{
                textTransform: "none",
                borderColor: "#05344c",
                color: "#05344c",
                "&:hover": { backgroundColor: "#f0f4f8" },
              }}
            >
              Add Another Combination
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box 
          sx={{ 
            mt: 4, 
            pt: 3,
            borderTop: "1px solid #e0e0e0",
            display: "flex", 
            gap: 2,
            justifyContent: "flex-end"
          }}
        >
          <CancelButton href="/admin/home-catalog/design">
            Cancel
          </CancelButton>
          <ReusableButton 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? "Creating..." : "Create Design"}
          </ReusableButton>
        </Box>
      </Box>
    </>
  );
};

export default AddDesignType;