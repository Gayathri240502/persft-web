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
  CircularProgress,
  Alert,
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

interface Attribute {
  _id: string;
  name: string;
  values: string[];
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
    attributes: [] as Attribute[],
  });

  const [loading, setLoading] = useState(false);
  const [fetchingDropdowns, setFetchingDropdowns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch initial dropdowns (categories and work groups)
  useEffect(() => {
    const fetchInitialDropdowns = async () => {
      if (!token) return;
      
      setFetchingDropdowns(true);
      setError(null);
      
      try {
        const [catRes, wgRes] = await Promise.all([
          fetch(`${apiUrl}/products/dropdowns/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/products/dropdowns/work-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catRes.ok) {
          throw new Error(`Failed to fetch categories: ${catRes.status}`);
        }
        
        if (!wgRes.ok) {
          throw new Error(`Failed to fetch work groups: ${wgRes.status}`);
        }

        const catData = await catRes.json();
        const wgData = await wgRes.json();

        setDropdowns((prev) => ({
          ...prev,
          categories: catData.categories || [],
          workGroups: wgData.workGroups || [],
        }));
      } catch (err) {
        console.error("Error fetching initial dropdowns:", err);
        setError("Failed to fetch dropdown options. Please refresh the page.");
      } finally {
        setFetchingDropdowns(false);
      }
    };

    fetchInitialDropdowns();
  }, [token, apiUrl]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!formData.category) {
      setDropdowns(prev => ({ ...prev, subCategories: [] }));
      return;
    }
    
    const fetchSubCategories = async () => {
      setFetchingDropdowns(true);
      
      try {
        const res = await fetch(
          `${apiUrl}/products/dropdowns/subcategories/${formData.category}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch subcategories: ${res.status}`);
        }

        const data = await res.json();

        setDropdowns((prev) => ({
          ...prev,
          subCategories: data.subCategories || [],
        }));
        
        // Clear the subCategory selection when category changes
        setFormData(prev => ({ ...prev, subCategory: "" }));
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        setError("Failed to fetch subcategories");
      } finally {
        setFetchingDropdowns(false);
      }
    };

    fetchSubCategories();
  }, [formData.category, token, apiUrl]);

  // Fetch attributes when subCategory changes
  useEffect(() => {
    if (!formData.subCategory) {
      setDropdowns(prev => ({ ...prev, attributes: [] }));
      return;
    }
    
    const fetchAttributes = async () => {
      setFetchingDropdowns(true);
      
      try {
        const res = await fetch(
          `${apiUrl}/products/attributes/${formData.subCategory}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch attributes: ${res.status}`);
        }

        const data = await res.json();

        setDropdowns((prev) => ({
          ...prev,
          attributes: data.attributes || [],
        }));
      } catch (err) {
        console.error("Error fetching attributes:", err);
        setError("Failed to fetch attributes");
      } finally {
        setFetchingDropdowns(false);
      }
    };

    fetchAttributes();
  }, [formData.subCategory, token, apiUrl]);

  // Fetch work tasks when work group changes
  useEffect(() => {
    if (!formData.workGroup) {
      setDropdowns(prev => ({ ...prev, workTasks: [] }));
      return;
    }
    
    const fetchWorkTasks = async () => {
      setFetchingDropdowns(true);
      
      try {
        const res = await fetch(
          `${apiUrl}/products/dropdowns/work-tasks/${formData.workGroup}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch work tasks: ${res.status}`);
        }

        const data = await res.json();

        setDropdowns((prev) => ({
          ...prev,
          workTasks: data.workTasks || [],
        }));
        
        // Clear the workTask selection when workGroup changes
        setFormData(prev => ({ ...prev, workTask: "" }));
      } catch (err) {
        console.error("Error fetching work tasks:", err);
        setError("Failed to fetch work tasks");
      } finally {
        setFetchingDropdowns(false);
      }
    };

    fetchWorkTasks();
  }, [formData.workGroup, token, apiUrl]);

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
    if (!file) return;
    
    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      setError("File must be JPG, JPEG, or PNG format");
      return;
    }
    
    // Validate file size (60KB = 61440 bytes)
    if (file.size > 61440) {
      setError("File size must be less than 60KB");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const requiredFields = [
      "name", 
      "description", 
      "category", 
      "subCategory", 
      "workGroup", 
      "workTask"
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return false;
    }
    
    if (formData.price && isNaN(Number(formData.price))) {
      setError("Price must be a valid number");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create product (${response.status})`);
      }

      router.push("/admin/product-catalog/products");
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(err instanceof Error ? err.message : "An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {fetchingDropdowns && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Loading options...
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Description *"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            fullWidth
            required
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }} required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleSelectChange}
              disabled={fetchingDropdowns || dropdowns.categories.length === 0}
            >
              {dropdowns.categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }} required>
            <InputLabel>Sub Category</InputLabel>
            <Select
              name="subCategory"
              value={formData.subCategory}
              label="Sub Category"
              onChange={handleSelectChange}
              disabled={fetchingDropdowns || !formData.category || dropdowns.subCategories.length === 0}
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
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />

          <FormControl fullWidth sx={{ mb: 3 }} required>
            <InputLabel>Work Group</InputLabel>
            <Select
              name="workGroup"
              value={formData.workGroup}
              label="Work Group"
              onChange={handleSelectChange}
              disabled={fetchingDropdowns || dropdowns.workGroups.length === 0}
            >
              {dropdowns.workGroups.map((wg) => (
                <MenuItem key={wg._id} value={wg._id}>
                  {wg.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }} required>
            <InputLabel>Work Task</InputLabel>
            <Select
              name="workTask"
              value={formData.workTask}
              label="Work Task"
              onChange={handleSelectChange}
              disabled={fetchingDropdowns || !formData.workGroup || dropdowns.workTasks.length === 0}
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

          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mb: 1 }}
            >
              Upload Thumbnail
              <input 
                type="file" 
                hidden 
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png" 
              />
            </Button>
            
            {formData.thumbnail && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img 
                  src={formData.thumbnail} 
                  alt="Product thumbnail preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }} 
                />
              </Box>
            )}
            
            <Typography variant="body2" sx={{ mt: 1 }}>
              {formData.thumbnail ? "File uploaded" : "No file selected"}
            </Typography>
            
            <Typography variant="caption" sx={{ color: "#666", display: 'block' }}>
              Accepted formats: JPG, JPEG, PNG. Max size: 60KB.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || fetchingDropdowns}
        >
          {loading ? "Submitting..." : "Save Product"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/products" variant="outlined">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default AddProduct;