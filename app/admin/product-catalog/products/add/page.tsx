"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddProduct = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  type Attribute = {
  id: string;
  name: string;
  value: string;
  type: string;
  // Add any other properties if needed
};

  // Form state
  const [product, setProduct] = useState({
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
    attributeValues: [] as { attribute: string; value: string }[],
  });

  // File upload state
 

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [workTasks, setWorkTasks] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]); // Raw API response
 const [flattenedAttributes, setFlattenedAttributes] = useState<Attribute[]>([]); // Flattened attributes for display

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
          ...options,
        }
      );

      if (!response.ok) {
        // Attempt to parse JSON error message if available
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  };

  // Helper function to flatten attribute groups
  const flattenAttributeGroups = (attributeGroups: any[]) => {
    const flattened: any[] = [];
    attributeGroups.forEach((group: any) => {
      if (group.attributes && Array.isArray(group.attributes)) {
        group.attributes.forEach((attr: any) => {
          flattened.push({
            id: attr.id,
            name: attr.name,
            type: attr.type,
            options: attr.options || [],
            order: attr.order || 0,
            groupName: group.name, // Keep reference to the group name
          });
        });
      }
    });
    return flattened;
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [categoriesData, workGroupsData] = await Promise.all([
        apiCall("/products/dropdowns/categories"),
        apiCall("/products/dropdowns/work-groups"),
      ]);

      setCategories(categoriesData);
      setWorkGroups(workGroupsData);
    } catch (err: any) {
      setError(err.message || "Failed to load initial data");
    }
    setLoading(false);
  };

  // Load subcategories when category changes
  useEffect(() => {
    if (product.category) {
      loadSubCategories(product.category);
    } else {
      setSubCategories([]);
      setProduct((prev) => ({ ...prev, subCategory: "", attributeValues: [] }));
    }
  }, [product.category]);

  // Load work tasks when work group changes
  useEffect(() => {
    if (product.workGroup) {
      loadWorkTasks(product.workGroup);
    } else {
      setWorkTasks([]);
      setProduct((prev) => ({ ...prev, workTask: "" }));
    }
  }, [product.workGroup]);

  // Load attributes when subcategory changes
  useEffect(() => {
    if (product.subCategory) {
      loadAttributes(product.subCategory);
    } else {
      setAttributeGroups([]);
      setFlattenedAttributes([]);
      setProduct((prev) => ({ ...prev, attributeValues: [] }));
    }
  }, [product.subCategory]);

  const loadSubCategories = async (categoryId: string) => {
    try {
      const data = await apiCall(
        `/products/dropdowns/subcategories/${categoryId}`
      );
      setSubCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subcategories");
    }
  };

  const loadWorkTasks = async (workGroupId: string) => {
    try {
      const data = await apiCall(
        `/products/dropdowns/work-tasks/${workGroupId}`
      );
      setWorkTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load work tasks");
    }
  };

  const loadAttributes = async (subCategoryId: string) => {
    try {
      const data = await apiCall(`/products/attributes/${subCategoryId}`);
      setAttributeGroups(data);

      // Flatten the attribute groups to get individual attributes
      const flattened = flattenAttributeGroups(data);
      setFlattenedAttributes(flattened);

      // Reset attribute values when attributes change to ensure consistency
      setProduct((prev) => ({ ...prev, attributeValues: [] }));
    } catch (err: any) {
      setError(err.message || "Failed to load attributes");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // const handleThumbnailChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setSelectedFileName(file.name);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64String = reader.result as string;
  //       setProduct((prev) => ({ ...prev, thumbnail: base64String }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const addNewAttributeEntry = () => {
    setProduct((prev) => ({
      ...prev,
      attributeValues: [...prev.attributeValues, { attribute: "", value: "" }],
    }));
  };

  const removeAttributeEntry = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      attributeValues: prev.attributeValues.filter((_, i) => i !== index),
    }));
  };

  const updateAttributeEntry = (
    index: number,
    field: "attribute" | "value",
    newValue: string
  ) => {
    setProduct((prev) => {
      const newAttributeValues = [...prev.attributeValues];
      newAttributeValues[index] = {
        ...newAttributeValues[index],
        [field]: newValue,
      };
      return { ...prev, attributeValues: newAttributeValues };
    });
  };

  const validateForm = () => {
    if (!product.name) {
      setError("Product name is required");
      return false;
    }
    if (!product.sku) {
      setError("SKU is required");
      return false;
    }
    if (!product.price) {
      setError("Price is required");
      return false;
    }
    if (!product.brand) {
      setError("Brand is required");
      return false;
    }
    if (!product.category) {
      setError("Category is required");
      return false;
    }
    if (!product.subCategory) {
      setError("Subcategory is required");
      return false;
    }

    if (isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      setError("Please enter a valid price greater than 0");
      return false;
    }

    // Validate attributes - assuming all attributes are required
    for (const attribute of flattenedAttributes) {
      const attributeId = attribute.id;
      const attributeName = attribute.name;

      // Check if this attribute has a non-empty value in product.attributeValues
      const hasValue = product.attributeValues.some(
        (av) => av.attribute === attributeId && av.value.trim() !== ""
      );

      if (!hasValue) {
        setError(`Missing value for required attribute: ${attributeName}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      const productData = {
        ...product,
        price: parseFloat(product.price),
      };

      const body = JSON.stringify(productData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to create product");
      }

      router.push("/admin/product-catalog/products");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Basic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Name *"
                fullWidth
                value={product.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="SKU *"
                fullWidth
                value={product.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Price *"
                type="number"
                fullWidth
                value={product.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Brand *"
                fullWidth
                value={product.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Model Name"
                fullWidth
                value={product.modelName}
                onChange={(e) => handleInputChange("modelName", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Coohom ID"
                fullWidth
                value={product.coohomId}
                onChange={(e) => handleInputChange("coohomId", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={product.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Thumbnail Upload */}
      {/* <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Product Image
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                <input
                  type="file"
                  hidden
                  onChange={handleThumbnailChange}
                  accept="image/*"
                />
              </Button>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {selectedFileName}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#999" }}>
              Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
            </Typography>
            {product.thumbnail && (
              <Box>
                <Typography variant="subtitle2">Preview:</Typography>
                <img
                  src={product.thumbnail}
                  alt="Thumbnail Preview"
                  style={{ width: 200, borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card> */}

      {/* Categories and Classification */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Categories & Classification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={product.category}
                  label="Category *"
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                >
                  {categories.map((category: any) => (
                    <MenuItem
                      key={category._id || category.id}
                      value={category._id || category.id}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                disabled={!product.category}
                sx={{ mb: 2 }}
              >
                <InputLabel>Subcategory *</InputLabel>
                <Select
                  value={product.subCategory}
                  label="Subcategory *"
                  onChange={(e) =>
                    handleInputChange("subCategory", e.target.value)
                  }
                >
                  {subCategories.map((subCategory: any) => (
                    <MenuItem
                      key={subCategory._id || subCategory.id}
                      value={subCategory._id || subCategory.id}
                    >
                      {subCategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Work Group</InputLabel>
                <Select
                  value={product.workGroup}
                  label="Work Group"
                  onChange={(e) =>
                    handleInputChange("workGroup", e.target.value)
                  }
                >
                  {workGroups.map((workGroup: any) => (
                    <MenuItem
                      key={workGroup._id || workGroup.id}
                      value={workGroup._id || workGroup.id}
                    >
                      {workGroup.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                disabled={!product.workGroup}
                sx={{ mb: 2 }}
              >
                <InputLabel>Work Task</InputLabel>
                <Select
                  value={product.workTask}
                  label="Work Task"
                  onChange={(e) =>
                    handleInputChange("workTask", e.target.value)
                  }
                >
                  {workTasks.map((workTask: any) => (
                    <MenuItem
                      key={workTask._id || workTask.id}
                      value={workTask._id || workTask.id}
                    >
                      {workTask.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attributes */}
      {flattenedAttributes.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" color="primary">
                Product Attributes
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewAttributeEntry}
                size="small"
              >
                Add Attribute
              </Button>
            </Box>

            {product.attributeValues.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No attributes added yet. Click Add Attribute to get started.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {product.attributeValues.map((attr: any, index: number) => (
                  <Grid item xs={12} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Grid container spacing={2} sx={{ alignItems: "center" }}>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Select Attribute</InputLabel>
                            <Select
                              value={attr.attribute}
                              label="Select Attribute"
                              onChange={(e) =>
                                updateAttributeEntry(
                                  index,
                                  "attribute",
                                  e.target.value
                                )
                              }
                            >
                              {flattenedAttributes.map((attribute: any) => (
                                <MenuItem
                                  key={attribute.id}
                                  value={attribute.id}
                                >
                                  {attribute.name} ({attribute.type})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Attribute Value"
                            value={attr.value}
                            onChange={(e) =>
                              updateAttributeEntry(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Enter attribute value"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeAttributeEntry(index)}
                            startIcon={<DeleteIcon />}
                            fullWidth
                            size="small"
                          >
                            Remove
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Attribute Values Display */}
      {product.attributeValues.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: "grey.50" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attribute Summary
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {product.attributeValues.map((attr: any, index: number) => {
                const attributeInfo = flattenedAttributes.find(
                  (a: any) => a.id === attr.attribute
                );
                const attributeName = attributeInfo?.name || "Unknown";
                const attributeType = attributeInfo?.type || "Unknown";
                return (
                  <Chip
                    key={index}
                    label={`${attributeName} (${attributeType}): ${attr.value}`}
                    variant="filled"
                    color="primary"
                    size="medium"
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton type="submit" disabled={submitLoading}>
          {submitLoading ? <CircularProgress size={24} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/products">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddProduct;
