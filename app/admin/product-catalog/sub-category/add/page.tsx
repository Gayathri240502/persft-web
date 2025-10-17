"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Category {
  _id: string;
  name: string;
}

interface AttributeGroup {
  _id: string;
  name: string;
}

const AddSubCategory = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "",
    category: "",
    attributeGroups: [] as string[],
    hsnCode: "", // NEW
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState(""); // base64 string
  const [selectedFileName, setSelectedFileName] = useState(""); // empty initially

  // Fetch categories and attribute groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, attrRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/attribute-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catRes.ok || !attrRes.ok) {
          throw new Error("Failed to load options");
        }

        const [catData, attrData] = await Promise.all([
          catRes.json(),
          attrRes.json(),
        ]);

        setCategories(catData.categories || []);
        setAttributeGroups(attrData.attributeGroups || []);
      } catch (err) {
        setError("Error fetching categories or attribute groups");
      }
    };

    fetchData();
  }, [token]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      attributeGroups: checked
        ? [...prev.attributeGroups, value]
        : prev.attributeGroups.filter((id) => id !== value),
    }));
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 60 * 1024; // 60KB
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG files are allowed.");
        setSelectedFileName("");
        setThumbnail("");
        return;
      }

      if (file.size > maxSize) {
        setError("File size exceeds 60KB.");
        setSelectedFileName("");
        setThumbnail("");
        return;
      }

      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setThumbnail(base64String);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Validate required fields
  const validateForm = () => {
    if (
      !formData.name ||
      !formData.category ||
      formData.attributeGroups.length === 0 ||
      !formData.hsnCode
    ) {
      setError(
        "Name, category, HSN Code, and at least one attribute group are required."
      );
      return false;
    }
    setError(null);
    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const finalData = {
      ...formData,
      description: formData.description.trim() || "N/A",
      thumbnail: thumbnail || "",
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create sub-category");
      }

      router.push("/admin/product-catalog/sub-category");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label=" Add New Sub Category" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add New Sub Category
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={formData.category}
            onChange={handleCategoryChange}
            label="Category"
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 3 }}
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={3}
          fullWidth
          sx={{ mb: 3 }}
        />

        <TextField
          label="HSN Code"
          name="hsnCode"
          value={formData.hsnCode}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
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
              {selectedFileName || "No Image"}
            </Typography>
          </Box>
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

        <Typography variant="h6" sx={{ mb: 1 }}>
          Attribute Groups
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {attributeGroups.map((group) => (
            <Grid item xs={12} sm={6} key={group._id}>
              <FormControlLabel
                control={
                  <Checkbox
                    value={group._id}
                    checked={formData.attributeGroups.includes(group._id)}
                    onChange={handleCheckboxChange}
                  />
                }
                label={group.name}
              />
            </Grid>
          ))}
        </Grid>

        {error && (
          <Typography sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </ReusableButton>
          <CancelButton href="/admin/product-catalog/sub-category">
            Cancel
          </CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default AddSubCategory;
