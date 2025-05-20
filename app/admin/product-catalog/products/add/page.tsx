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

interface SubCategory {
  _id: string;
  name: string;
}

interface WorkGroup {
  _id: string;
  name: string;
}

interface WorkTask {
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
    attributeValues: [],
  });

  const [dropdowns, setDropdowns] = useState({
    categories: [] as Category[],
    subCategories: [] as SubCategory[],
    workGroups: [] as WorkGroup[],
    workTasks: [] as WorkTask[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, wgRes] = await Promise.all([
          fetch(`${apiUrl}/products/dropdowns/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/products/dropdowns/work-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catRes.ok || !wgRes.ok) {
          throw new Error("Failed to fetch categories or work groups");
        }

        const catData = await catRes.json();
        const wgData = await wgRes.json();

        console.log("Fetched Categories:", catData);
        console.log("Fetched Work Groups:", wgData);

        setDropdowns((prev) => ({
          ...prev,
          categories: catData.categories || [],
          workGroups: wgData.workGroups || [],
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch categories or work groups");
      }
    };

    if (token) fetchDropdowns();
  }, [token]);

  useEffect(() => {
    if (formData.category) {
      const fetchSubCategories = async () => {
        try {
          const res = await fetch(
            `${apiUrl}/products/dropdowns/subcategories/${formData.category}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) throw new Error("Failed to fetch subcategories");

          const data = await res.json();
          console.log("Fetched SubCategories:", data);

          setDropdowns((prev) => ({
            ...prev,
            subCategories: data.subCategories || [],
          }));
        } catch (err) {
          console.error(err);
          setError("Failed to fetch subcategories");
        }
      };

      fetchSubCategories();
    }
  }, [formData.category, token]);

  useEffect(() => {
    if (formData.workGroup) {
      const fetchWorkTasks = async () => {
        try {
          const res = await fetch(
            `${apiUrl}/products/dropdowns/work-tasks/${formData.workGroup}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) throw new Error("Failed to fetch work tasks");

          const data = await res.json();
          console.log("Fetched Work Tasks:", data);

          setDropdowns((prev) => ({
            ...prev,
            workTasks: data.workTasks || [],
          }));
        } catch (err) {
          console.error(err);
          setError("Failed to fetch work tasks");
        }
      };

      fetchWorkTasks();
    }
  }, [formData.workGroup, token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
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
      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create product");

      router.push("/admin/product-catalog/products");
    } catch (err) {
      console.error(err);
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
                <MenuItem key={task._id} value={task._id}>
                  {task.name}
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
          <TextField
            label="Model Name"
            name="modelName"
            value={formData.modelName}
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
          {formData.thumbnail ? "File uploaded" : "No file selected"}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: "#999" }}>
        Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
      </Typography>

      {error && (
        <Typography sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
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
