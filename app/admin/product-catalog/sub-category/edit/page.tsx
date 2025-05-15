"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditSubCategory = () => {
  const { token } = getTokenAndRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [categories, setCategories] = useState<any[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedAttributeGroups, setSelectedAttributeGroups] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, attributeGroupsRes, subCategoryRes] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/categories-selection`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/attribute-groups-selection`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!categoriesRes.ok || !attributeGroupsRes.ok || !subCategoryRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const categoriesData = await categoriesRes.json();
        const attributeGroupsData = await attributeGroupsRes.json();
        const subCategoryData = await subCategoryRes.json();

        setCategories(categoriesData?.data || []);
        setAttributeGroups(attributeGroupsData?.data || []);

        const sub = subCategoryData?.data || subCategoryData;
        setCategory(sub.category || "");
        setName(sub.name || "");
        setDescription(sub.description || "");
        setThumbnail(sub.thumbnail || "");
        setSelectedAttributeGroups((sub.attributeGroups || []).map(String));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchInitialData();
  }, [id, token]);

  const handleAttributeGroupToggle = (groupId: string) => {
    setSelectedAttributeGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 60000) {
        setError("File size should not exceed 60KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !thumbnail || !category) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            thumbnail,
            category,
            attributeGroups: selectedAttributeGroups,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update sub-category.");
      }

      router.push("/admin/product-catalog/sub-category");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Sub Category
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>Select a category</em>
          </MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Attribute Groups
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {attributeGroups.map((group) => (
              <FormControlLabel
                key={group.id}
                control={
                  <Checkbox
                    checked={selectedAttributeGroups.includes(group.id)}
                    onChange={() => handleAttributeGroupToggle(group.id)}
                  />
                }
                label={group.name}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/sub-category">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default EditSubCategory;
