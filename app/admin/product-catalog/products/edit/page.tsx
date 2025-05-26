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
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Define interfaces for better type safety
interface DropdownItem {
  _id: string;
  id?: string; // Some APIs might use 'id' instead of '_id'
  name: string;
  description?: string;
  // Add other properties relevant to workTask if needed
  targetDays?: number;
  bufferDays?: number;
  poDays?: number;
}

interface AttributeDefinition {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  type?: string;
}

interface ProductAttributeValue {
  attribute: string; // This should be the _id of the attribute definition
  value: string;
}

const AddEditProduct = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { token } = getTokenAndRole();

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    price: "",
    brand: "",
    modelName: "",
    coohomId: "",
    description: "",
    thumbnail: "",
    category: "", // Stores ID
    subCategory: "", // Stores ID
    workGroup: "", // Stores ID
    workTask: "", // Stores ID
    attributeValues: [] as ProductAttributeValue[],
  });

  const [selectedFileName, setSelectedFileName] = useState<string>("No file selected");

  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [subCategories, setSubCategories] = useState<DropdownItem[]>([]);
  const [workGroups, setWorkGroups] = useState<DropdownItem[]>([]);
  const [workTasks, setWorkTasks] = useState<DropdownItem[]>([]);
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesData, workGroupsData] = await Promise.all([
          apiCall("/products/dropdowns/categories"),
          apiCall("/products/dropdowns/work-groups"),
        ]);

        setCategories(categoriesData);
        setWorkGroups(workGroupsData);

        if (productId) {
          const productData = await apiCall(`/products/${productId}`);

          // Extract only the IDs from nested objects for form state
          setProduct({
            ...productData,
            price: productData.price.toString(),
            category: productData.category?._id || "",
            subCategory: productData.subCategory?._id || "",
            workGroup: productData.workGroup?._id || "",
            workTask: productData.workTask?._id || "",
            // Map attributeValues to store only the attribute ID and value
            attributeValues:
              productData.attributeValues?.map((av: any) => ({
                attribute: av.attribute?._id || av.attribute?.id || "",
                value: av.value,
              })) || [],
          });

          // Load related dropdowns based on fetched product data
          if (productData.category?._id) {
            await loadSubCategories(productData.category._id);
          }
          if (productData.workGroup?._id) {
            await loadWorkTasks(productData.workGroup._id);
          }
          if (productData.subCategory?._id) {
            await loadAttributes(productData.subCategory._id, productData.attributeValues); // Pass existing attribute values
          }
          setSelectedFileName(productData.thumbnail ? "File uploaded" : "No file selected");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load initial data or product data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productId, token]);

  // Load subcategories when category changes
  useEffect(() => {
    if (product.category) {
      loadSubCategories(product.category);
    } else {
      setSubCategories([]);
      // Only clear subCategory and attributes if category is explicitly unset by user,
      // not during initial load where product.category might be empty temporarily.
      if (!loading) { // Prevents clearing during initial data load
        setProduct((prev) => ({ ...prev, subCategory: "", attributeValues: [] }));
      }
    }
  }, [product.category, loading]);

  // Load work tasks when work group changes
  useEffect(() => {
    if (product.workGroup) {
      loadWorkTasks(product.workGroup);
    } else {
      setWorkTasks([]);
      if (!loading) {
        setProduct((prev) => ({ ...prev, workTask: "" }));
      }
    }
  }, [product.workGroup, loading]);

  // Load attributes when subcategory changes
  useEffect(() => {
    if (product.subCategory) {
      loadAttributes(product.subCategory, product.attributeValues);
    } else {
      setAttributes([]);
      if (!loading) {
        setProduct((prev) => ({ ...prev, attributeValues: [] }));
      }
    }
  }, [product.subCategory, loading]);


  const loadSubCategories = async (categoryId: string) => {
    try {
      const data = await apiCall(`/products/dropdowns/subcategories/${categoryId}`);
      setSubCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subcategories");
    }
  };

  const loadWorkTasks = async (workGroupId: string) => {
    try {
      const data = await apiCall(`/products/dropdowns/work-tasks/${workGroupId}`);
      setWorkTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load work tasks");
    }
  };

  const loadAttributes = async (subCategoryId: string, existingAttributeValues: ProductAttributeValue[] = []) => {
    try {
      const data: AttributeDefinition[] = await apiCall(`/products/attributes/${subCategoryId}`);
      setAttributes(data);

      setProduct((prev) => {
        // Filter out attribute values that no longer have a corresponding attribute definition
        const filteredAttributeValues = existingAttributeValues.filter((av) =>
          data.some((attrDef) => (attrDef._id || attrDef.id) === av.attribute)
        );

        // Add placeholders for attributes that are now required but not in the filtered list
        data.forEach((attrDef) => {
          const attrId = attrDef._id || attrDef.id;
          if (!filteredAttributeValues.some((av) => av.attribute === attrId)) {
            filteredAttributeValues.push({ attribute: attrId, value: "" });
          }
        });

        return { ...prev, attributeValues: filteredAttributeValues };
      });
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

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProduct((prev) => ({ ...prev, thumbnail: base64String }));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFileName("No file selected");
      setProduct((prev) => ({ ...prev, thumbnail: "" }));
    }
  };

  const addNewAttributeEntry = () => {
    // Only allow adding if there are available attributes to select
    if (attributes.length > 0) {
      setProduct((prev) => ({
        ...prev,
        attributeValues: [...prev.attributeValues, { attribute: "", value: "" }],
      }));
    } else {
      setError("No attributes available to add. Please select a subcategory first.");
    }
  };

  const removeAttributeEntry = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      attributeValues: prev.attributeValues.filter((_, i) => i !== index),
    }));
  };

  const updateAttributeEntry = (index: number, field: "attribute" | "value", newValue: string) => {
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

    // Validate attributes: ensure all attributes fetched for the selected subcategory have non-empty values
    for (const attributeDef of attributes) {
      const attributeId = (attributeDef as any)._id || (attributeDef as any).id;
      const attributeName = (attributeDef as any).name;

      const foundAttributeValue = product.attributeValues.find(
        (av) => av.attribute === attributeId
      );

      // If an attribute is required (i.e., it's in the 'attributes' state which is loaded based on subcategory)
      // but its value is missing or empty in `product.attributeValues`
      if (!foundAttributeValue || foundAttributeValue.value.trim() === "") {
        setError(`Missing value for required attribute: ${attributeName}`);
        return false;
      }
    }

    // Also check for duplicate attribute selections in the dynamic attribute fields
    const selectedAttributeIds = new Set<string>();
    for (const attrVal of product.attributeValues) {
      if (attrVal.attribute && selectedAttributeIds.has(attrVal.attribute)) {
        setError("Duplicate attribute selected. Please choose unique attributes.");
        return false;
      }
      if (attrVal.attribute) {
        selectedAttributeIds.add(attrVal.attribute);
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

      const method = productId ? "PUT" : "POST";
      const url = productId
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `Failed to ${productId ? "update" : "create"} product`);
      }

      router.push("/admin/products"); // Redirect after success
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {productId ? "Edit Product" : "Add Product"}
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
                onChange={(e) => handleInputChange("description", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Thumbnail Upload */}
      <Card sx={{ mb: 3 }}>
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
                <input type="file" hidden onChange={handleThumbnailChange} accept="image/*" />
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
      </Card>

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
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  {categories.map((category: DropdownItem) => (
                    <MenuItem key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!product.category} sx={{ mb: 2 }}>
                <InputLabel>Subcategory *</InputLabel>
                <Select
                  value={product.subCategory}
                  label="Subcategory *"
                  onChange={(e) => handleInputChange("subCategory", e.target.value)}
                >
                  {subCategories.map((subCategory: DropdownItem) => (
                    <MenuItem key={subCategory._id || subCategory.id} value={subCategory._id || subCategory.id}>
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
                  onChange={(e) => handleInputChange("workGroup", e.target.value)}
                >
                  {workGroups.map((workGroup: DropdownItem) => (
                    <MenuItem key={workGroup._id || workGroup.id} value={workGroup._id || workGroup.id}>
                      {workGroup.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!product.workGroup} sx={{ mb: 2 }}>
                <InputLabel>Work Task</InputLabel>
                <Select
                  value={product.workTask}
                  label="Work Task"
                  onChange={(e) => handleInputChange("workTask", e.target.value)}
                >
                  {workTasks.map((workTask: DropdownItem) => (
                    <MenuItem key={workTask._id || workTask.id} value={workTask._id || workTask.id}>
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
      {/* Show the attribute section only if subCategory is selected and attributes are loaded */}
      {product.subCategory && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" color="primary">
                Product Attributes
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewAttributeEntry}
                size="small"
              >
                Add Custom Attribute
              </Button>
            </Box>

            {product.attributeValues.length === 0 && attributes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  No attributes defined for this subcategory. Click "Add Custom Attribute" if needed.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {product.attributeValues.map((attr: ProductAttributeValue, index: number) => (
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
                              onChange={(e) => updateAttributeEntry(index, "attribute", e.target.value)}
                            >
                              {attributes.map((attribute: AttributeDefinition) => (
                                <MenuItem
                                  key={attribute._id || attribute.id}
                                  value={attribute._id || attribute.id}
                                >
                                  {attribute.name}
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
                            onChange={(e) => updateAttributeEntry(index, "value", e.target.value)}
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
              {product.attributeValues.map((attr: ProductAttributeValue, index: number) => {
                const attributeName =
                  attributes.find((a: AttributeDefinition) => (a._id || a.id) === attr.attribute)?.name || "Unknown";
                return (
                  <Chip
                    key={index}
                    label={`${attributeName}: ${attr.value}`}
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
          {submitLoading ? (
            <CircularProgress size={24} />
          ) : productId ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </ReusableButton>
        <CancelButton href="/admin/products">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddEditProduct;