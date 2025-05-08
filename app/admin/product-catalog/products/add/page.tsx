"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { SelectChangeEvent } from "@mui/material/Select";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

interface Category {
  _id: string;
  name: string;
}

interface WorkGroup {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
}

const AddProduct = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    brand: "",
    modelName: "",
    coohomId: "",
    description: "",
    thumbnail: "",
    category: "",
    subCategory: "",
    workGroup: "",
    workTask: "",
    attributeValues: [] as string[],
  });

  const [dropdowns, setDropdowns] = useState({
    categories: [] as Category[],
    subCategories: [] as SubCategory[],
    workGroups: [] as WorkGroup[],
    workTasks: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, wgRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/work-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catRes.ok || !wgRes.ok) {
          throw new Error("Failed to load dropdowns");
        }

        const [catData, wgData] = await Promise.all([catRes.json(), wgRes.json()]);

        setDropdowns({
          categories: catData.categories || [],
          workGroups: wgData.workGroups || [],
          subCategories: [],
          workTasks: [],
        });
      } catch (err) {
        setError("Error fetching dropdowns");
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (formData.category) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/subcategories/${formData.category}`)
        .then((res) => res.json())
        .then((data) =>
          setDropdowns((prev) => ({
            ...prev,
            subCategories: data.subCategories || [],
          }))
        )
        .catch(() => setError("Failed to fetch subcategories"));
    }
  }, [formData.category]);

  useEffect(() => {
    if (formData.workGroup) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/work-tasks/${formData.workGroup}`)
        .then((res) => res.json())
        .then((data) =>
          setDropdowns((prev) => ({
            ...prev,
            workTasks: data.workTasks || [],
          }))
        )
        .catch(() => setError("Failed to fetch work tasks"));
    }
  }, [formData.workGroup]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name!]: value }));
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
      !formData.subCategory ||
      !formData.workGroup ||
      !formData.workTask
    ) {
      setError("All required fields must be filled.");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      router.push("/admin/product-catalog/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Product
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
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
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleSelectChange}
            >
              {dropdowns.categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Sub Category</InputLabel>
            <Select
              name="subCategory"
              value={formData.subCategory}
              label="Sub Category"
              onChange={handleSelectChange}
            >
              {dropdowns.subCategories.map((sub) => (
                <MenuItem key={sub._id} value={sub._id}>
                  {sub.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Work Group</InputLabel>
            <Select
              name="workGroup"
              value={formData.workGroup}
              label="Work Group"
              onChange={handleSelectChange}
            >
              {dropdowns.workGroups.map((wg) => (
                <MenuItem key={wg._id} value={wg._id}>
                  {wg.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Work Task</InputLabel>
            <Select
              name="workTask"
              value={formData.workTask}
              label="Work Task"
              onChange={handleSelectChange}
            >
              {dropdowns.workTasks.map((task) => (
                <MenuItem key={task} value={task}>
                  {task}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Coohom ID"
            name="coohomId"
            value={formData.coohomId}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3 }}
          />
        </Grid>
      </Grid>

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
      <Typography variant="caption" sx={{ color: "#999" }}>
                        Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
                        </Typography>

      {error && (
        <Typography sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/products" variant="outlined">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddProduct;
