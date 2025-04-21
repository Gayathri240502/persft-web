"use client";

import React, { useState, useEffect } from "react";
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
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

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
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "",
    category: "",
    attributeGroups: [] as string[],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file.name }));
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      formData.attributeGroups.length === 0
    ) {
      setError("All fields are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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

      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Upload Thumbnail
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <Typography variant="body2">
          {formData.thumbnail || "No file selected"}
        </Typography>
      </Box>

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
  );
};

export default AddSubCategory;
