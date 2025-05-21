"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Button,
  
  
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";

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
}

const AddProduct = () => {
  const router = useRouter();
  const [form, setForm] = useState({
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
    attributeValues: [
      {
        attribute: "",
        value: "",
      },
    ],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingWorkGroups, setLoadingWorkGroups] = useState(false);
  const [loadingWorkTasks, setLoadingWorkTasks] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const [thumbnail, setThumbnail] = useState<string>("");
   const [selectedFileName, setSelectedFileName] =
      useState<string>("No file selected");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { token } = getTokenAndRole();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategories(data.categories || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingSubCategories(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSubCategories(data.subCategories || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch subcategories.");
      } finally {
        setLoadingSubCategories(false);
      }

      try {
        setLoadingWorkGroups(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWorkGroups(data.workGroups || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch work groups.");
      } finally {
        setLoadingWorkGroups(false);
      }

      try {
        setLoadingWorkTasks(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWorkTasks(data.workTasks || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch work tasks.");
      } finally {
        setLoadingWorkTasks(false);
      }

      try {
        setLoadingAttributes(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attributes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAttributes(data.attributes || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch attributes.");
      } finally {
        setLoadingAttributes(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setThumbnail(base64String);
        };
        reader.readAsDataURL(file);
      }
    };
  

  // For attributeValues array, we only support one item for now
  const handleAttributeChange = (
    index: number,
    field: "attribute" | "value",
    value: string
  ) => {
    const newAttributeValues = [...form.attributeValues];
    newAttributeValues[index] = { ...newAttributeValues[index], [field]: value };
    setForm((prev) => ({ ...prev, attributeValues: newAttributeValues }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Simple validation: check required fields
    if (
      !form.name ||
      !form.sku ||
      !form.price ||
      !form.brand ||
      !form.modelName ||
      !form.coohomId ||
      !form.description ||
      !form.category ||
      !form.subCategory ||
      !form.workGroup ||
      !form.workTask ||
      !form.attributeValues[0]?.attribute ||
      !form.attributeValues[0]?.value
    ) {
      setError("Please fill all required fields.");
      return;
    }

    // Prepare request body matching your condition exactly
    const body = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      brand: form.brand,
      modelName: form.modelName,
      coohomId: form.coohomId,
      description: form.description,
      thumbnail: form.thumbnail || "string", // default to "string" if empty
      category: form.category,
      subCategory: form.subCategory,
      workGroup: form.workGroup,
      workTask: form.workTask,
      attributeValues: form.attributeValues.map((av) => ({
        attribute: av.attribute,
        value: av.value,
      })),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add products");
      }

      await res.json();
      setSuccess("products added successfully!");

      setForm({
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
        attributeValues: [{ attribute: "", value: "" }],
      });

      router.push("/admin/product-catalog/products");
    } catch (err: any) {
      setError(err.message || "Something went wrong while adding the products.");
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    field: keyof typeof form,
    options: { _id: string; name: string }[],
    loading: boolean
  ) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e: SelectChangeEvent) => handleChange(field, e.target.value)}
        label={label}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} />
          </MenuItem>
        ) : options.length > 0 ? (
          options.map((opt) => (
            <MenuItem key={opt._id} value={opt._id}>
              {opt.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No {label.toLowerCase()}s found</MenuItem>
        )}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New Product
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2}>
        {[
          ["Name", "name"],
          ["SKU", "sku"],
          ["Price", "price"],
          ["Brand", "brand"],
          ["Model Name", "modelName"],
          ["Coohom ID", "coohomId"],
          ["Description", "description"],
        ].map(([label, key]) => (
          <Grid item xs={12} sm={6} key={key}>
            <TextField
              fullWidth
              label={label}
              value={form[key as keyof typeof form]}
              onChange={(e) => handleChange(key as keyof typeof form, e.target.value)}
              type={key === "price" ? "number" : "text"}
              multiline={key === "description"}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6}>
          {renderSelect("Category", form.category, "category", categories, loadingCategories)}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect("SubCategory", form.subCategory, "subCategory", subCategories, loadingSubCategories)}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect("Work Group", form.workGroup, "workGroup", workGroups, loadingWorkGroups)}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect("Work Task", form.workTask, "workTask", workTasks, loadingWorkTasks)}
        </Grid>

        {/* AttributeValues input: attribute dropdown + value text input */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Attribute</InputLabel>
            <Select
              value={form.attributeValues[0].attribute}
              onChange={(e) => handleAttributeChange(0, "attribute", e.target.value)}
              label="Attribute"
            >
              {loadingAttributes ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : attributes.length > 0 ? (
                attributes.map((attr) => (
                  <MenuItem key={attr._id} value={attr._id}>
                    {attr.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No attributes found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Attribute Value"
            value={form.attributeValues[0].value}
            onChange={(e) => handleAttributeChange(0, "value", e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      
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
      {selectedFileName}
    </Typography>
  </Box>

  {/* Help Text */}
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

          

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit}>Submit</ReusableButton>
        <CancelButton href="/admin/product-catalog/products">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddProduct;
