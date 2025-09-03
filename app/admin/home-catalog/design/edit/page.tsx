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
  CircularProgress,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useSearchParams, useRouter } from "next/navigation";

type CombinationType = {
  residenceType: string;
  roomType: string;
  theme: string;
};

type FormDataType = {
  name: string;
  description: string;
  coohomUrl: string;
  thumbnail: File | null;
  thumbnailBase64: string;
  thumbnailPreview: string;
  budgetCategory: string;
  price: number | string;
  combinations: CombinationType[];
};

const EditDesignType = () => {
  const { token } = useTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");
  const router = useRouter();

  const [residences, setResidences] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [allThemes, setAllThemes] = useState<any[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    coohomUrl: "",
    thumbnail: null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    budgetCategory: "",
    price: "",
    combinations: [{ residenceType: "", roomType: "", theme: "" }],
  });

  const [errors, setErrors] = useState<any>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxFileSize = 60 * 1024; // 60kb

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name should not be empty";
      isValid = false;
    }
    if (!formData.coohomUrl.trim()) {
      newErrors.coohomUrl = "Coohom URL should not be empty";
      isValid = false;
    } else if (!isValidUrl(formData.coohomUrl)) {
      newErrors.coohomUrl = "Coohom URL must be a valid URL";
      isValid = false;
    }

    if (!mongoIdRegex.test(formData.budgetCategory)) {
      newErrors.budgetCategory = "Select valid budget category";
      isValid = false;
    }

    const price = Number(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = "Please enter a valid price greater than 0";
      isValid = false;
    }

    formData.combinations.forEach((comb, idx) => {
      if (!mongoIdRegex.test(comb.residenceType)) {
        newErrors[`residenceType_${idx}`] = "Select valid residence type";
        isValid = false;
      }
      if (!mongoIdRegex.test(comb.roomType)) {
        newErrors[`roomType_${idx}`] = "Select valid room type";
        isValid = false;
      }
      if (!mongoIdRegex.test(comb.theme)) {
        newErrors[`theme_${idx}`] = "Select valid theme";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const handleCombinationChange = (
    index: number,
    field: keyof CombinationType,
    value: string
  ) => {
    const newCombinations = [...formData.combinations];
    newCombinations[index][field] = value;

    // Reset dependent fields if necessary
    if (field === "residenceType") newCombinations[index].roomType = "";
    if (field === "roomType") newCombinations[index].theme = "";

    setFormData((prev) => ({ ...prev, combinations: newCombinations }));
    setErrors((prev: any) => ({ ...prev, [`${field}_${index}`]: "" }));
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
    setFormData((prev) => ({
      ...prev,
      combinations: prev.combinations.filter((_, i) => i !== index),
    }));
  };

  const convertBase64ToImageUrl = (base64String: string) => {
    if (!base64String) return "";
    if (base64String.startsWith("data:image/")) return base64String;
    return `data:image/jpeg;base64,${base64String}`;
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedFileTypes.includes(file.type)) {
      setErrors((prev: any) => ({
        ...prev,
        thumbnail: "Invalid file type. Please upload JPG, JPEG, or PNG.",
      }));
      return;
    }

    if (file.size > maxFileSize) {
      setErrors((prev: any) => ({
        ...prev,
        thumbnail: "File size exceeds 60KB limit.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailBase64: base64Result,
        thumbnailPreview: base64Result,
      }));
      setErrors((prev: any) => ({ ...prev, thumbnail: "" }));
    };
    reader.readAsDataURL(file);
  };

  // Helper function to get available rooms for a residence type
  const getAvailableRooms = (residenceTypeId: string) => {
    const residence = residences.find(res => res.id === residenceTypeId);
    return residence ? residence.roomTypes : [];
  };

  // Helper function to get available themes for a room type
  const getAvailableThemes = (roomTypeId: string) => {
    // Find the room type across all residences
    for (const residence of residences) {
      const room = residence.roomTypes.find((room: any) => room.id === roomTypeId);
      if (room) {
        return room.themes;
      }
    }
    return [];
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [designRes, selectionTreeRes, budgetRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/selection-tree`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/budget-categories`, { headers }),
      ]);

      if (!designRes.ok || !selectionTreeRes.ok || !budgetRes.ok) {
        throw new Error("Failed to fetch initial data");
      }

      const [designData, selectionTreeData, budgetData] = await Promise.all([
        designRes.json(),
        selectionTreeRes.json(),
        budgetRes.json(),
      ]);

      // Store selection tree data with proper structure
      const formattedResidences = selectionTreeData.map((res: any) => ({
        id: res.id,
        name: res.name,
        roomTypes: res.roomTypes.map((room: any) => ({
          id: room.id,
          name: room.name,
          residenceType: res.id, // Add reference to parent residence
          themes: room.themes.map((theme: any) => ({
            id: theme.id,
            name: theme.name,
            roomType: room.id // Add reference to parent room
          }))
        }))
      }));

      setResidences(formattedResidences);
      
      // Flatten all rooms and themes for easier lookup
      const allRoomsFlat = formattedResidences.flatMap((res: any) => res.roomTypes);
      const allThemesFlat = allRoomsFlat.flatMap((room: any) => room.themes);
      
      setAllRooms(allRoomsFlat);
      setAllThemes(allThemesFlat);

      setBudgetCategories(
        Array.isArray(budgetData)
          ? budgetData
          : budgetData.budgetCategories || budgetData.data || []
      );

      const thumbnailPreview = designData.thumbnail
        ? convertBase64ToImageUrl(designData.thumbnail)
        : designData.thumbnailUrl || "";

      setFormData({
        name: designData.name || "",
        description: designData.description || "",
        coohomUrl: designData.coohomUrl || "",
        thumbnail: null,
        thumbnailBase64: designData.thumbnail || "",
        thumbnailPreview,
        budgetCategory: designData.budgetCategory || "",
        price: designData.price !== undefined && designData.price !== null
          ? designData.price
          : "",
        combinations:
          designData.combinations?.map((c: any) => ({
            residenceType: c.residenceType?._id || "",
            roomType: c.roomType?._id || "",
            theme: c.theme?._id || "",
          })) || [{ residenceType: "", roomType: "", theme: "" }],
      });
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setApiError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (designId && token) {
      fetchData();
    }
  }, [designId, token]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description.trim() || "N/A",
        coohomUrl: formData.coohomUrl,
        budgetCategory: formData.budgetCategory,
        price: Number(formData.price),
        combinations: formData.combinations,
        ...(formData.thumbnailBase64 && { thumbnail: formData.thumbnailBase64 }),
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update design");
      }

      setSuccess(true);
      router.push("/admin/home-catalog/design");
    } catch (err: any) {
      console.error("Submit error:", err);
      setApiError(err.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Design Types" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Edit Design Type
        </Typography>

        {/* Name */}
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

        {/* Coohom URL */}
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

        {/* Description */}
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

        {/* Price */}
        <TextField
          label="Price"
          name="price"
          type="number"
          fullWidth
          sx={{ mb: 3 }}
          value={formData.price}
          onChange={handleInputChange}
          error={!!errors.price}
          helperText={errors.price}
          required
          inputProps={{ min: 0, step: 0.01 }}
        />

        {/* Budget Category */}
        <FormControl fullWidth error={!!errors.budgetCategory} sx={{ mb: 3 }}>
          <InputLabel required>Budget Category</InputLabel>
          <Select
            value={formData.budgetCategory}
            onChange={(e) =>
              handleInputChange({
                target: { name: "budgetCategory", value: e.target.value },
              })
            }
          >
            {budgetCategories.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
          {errors.budgetCategory && (
            <FormHelperText>{errors.budgetCategory}</FormHelperText>
          )}
        </FormControl>

        {/* Thumbnail Upload */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Upload Thumbnail
              <input
                type="file"
                hidden
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleThumbnailChange}
              />
            </Button>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {formData.thumbnail
                ? formData.thumbnail.name
                : "No new file selected"}
            </Typography>
          </Box>

          {formData.thumbnailPreview && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Current Thumbnail:
              </Typography>
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail Preview"
                style={{
                  width: 200,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </Box>
          )}
        </Box>

        {/* Combinations */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Combinations
        </Typography>

        {formData.combinations.map((comb, index) => (
          <Grid
            container
            spacing={2}
            key={index}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={!!errors[`residenceType_${index}`]}>
                <InputLabel required>Residence Type</InputLabel>
                <Select
                  value={comb.residenceType}
                  onChange={(e) =>
                    handleCombinationChange(
                      index,
                      "residenceType",
                      e.target.value as string
                    )
                  }
                >
                  {residences.map((res: any) => (
                    <MenuItem key={res.id} value={res.id}>
                      {res.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`residenceType_${index}`] && (
                  <FormHelperText>
                    {errors[`residenceType_${index}`]}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={!!errors[`roomType_${index}`]}>
                <InputLabel required>Room Type</InputLabel>
                <Select
                  value={comb.roomType}
                  onChange={(e) =>
                    handleCombinationChange(
                      index,
                      "roomType",
                      e.target.value as string
                    )
                  }
                  disabled={!comb.residenceType}
                >
                  {getAvailableRooms(comb.residenceType).map((room: any) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`roomType_${index}`] && (
                  <FormHelperText>{errors[`roomType_${index}`]}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={!!errors[`theme_${index}`]}>
                <InputLabel required>Theme</InputLabel>
                <Select
                  value={comb.theme}
                  onChange={(e) =>
                    handleCombinationChange(
                      index,
                      "theme",
                      e.target.value as string
                    )
                  }
                  disabled={!comb.roomType}
                >
                  {getAvailableThemes(comb.roomType).map((theme: any) => (
                    <MenuItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`theme_${index}`] && (
                  <FormHelperText>{errors[`theme_${index}`]}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <IconButton
                color="error"
                onClick={() => removeCombination(index)}
                disabled={formData.combinations.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addCombination}
        >
          Add Combination
        </Button>

        {/* Error / Success */}
        {apiError && (
          <Typography sx={{ mt: 2, color: "error.main" }}>
            {apiError}
          </Typography>
        )}
        {success && (
          <Typography sx={{ mt: 2, color: "success.main" }}>
            Design updated successfully!
          </Typography>
        )}

        {/* Actions */}
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Update"}
          </ReusableButton>
          <CancelButton href="/admin/home-catalog/design">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default EditDesignType;