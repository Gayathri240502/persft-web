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
import ReusableButton from "@/app/components/Button"; // Assuming this path is correct
import CancelButton from "@/app/components/CancelButton"; // Assuming this path is correct
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession"; // Assuming this path is correct
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

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

export default function AddProduct() {
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

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingCategories(true);
        setLoadingWorkGroups(true);

        const [categoriesRes, workGroupsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/categories`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/work-groups`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const categoriesData = await categoriesRes.json();
        const workGroupsData = await workGroupsRes.json();

        setCategories(categoriesData.categories || categoriesData || []);
        setWorkGroups(workGroupsData.workGroups || workGroupsData || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch initial data.");
      } finally {
        setLoadingCategories(false);
        setLoadingWorkGroups(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!form.category) {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      try {
        setLoadingSubCategories(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/subcategories/${form.category}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setSubCategories(data.subCategories || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch subcategories.");
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [form.category, token]);

  // Fetch work tasks when work group changes
  useEffect(() => {
    if (!form.workGroup) {
      setWorkTasks([]);
      return;
    }

    const fetchWorkTasks = async () => {
      try {
        setLoadingWorkTasks(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/work-tasks/${form.workGroup}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setWorkTasks(data.workTasks || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch work tasks.");
      } finally {
        setLoadingWorkTasks(false);
      }
    };

    fetchWorkTasks();
  }, [form.workGroup, token]);

  // Fetch attributes when subcategory changes
  useEffect(() => {
    if (!form.subCategory) {
      setAttributes([]);
      return;
    }

    const fetchAttributes = async () => {
      try {
        setLoadingAttributes(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/attributes/${form.subCategory}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAttributes(data.attributes || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch attributes.");
      } finally {
        setLoadingAttributes(false);
      }
    };

    fetchAttributes();
  }, [form.subCategory, token]);

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
        setForm((prev) => ({ ...prev, thumbnail: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttributeChange = (
    index: number,
    field: "attribute" | "value",
    value: string
  ) => {
    const newAttributeValues = [...form.attributeValues];
    newAttributeValues[index] = {
      ...newAttributeValues[index],
      [field]: value,
    };
    setForm((prev) => ({ ...prev, attributeValues: newAttributeValues }));
  };

  const handleSelectChange = (
    field: keyof typeof form,
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    
    setForm(prev => {
      // Handle reset logic for dependent fields
      if (field === "category") {
        return {
          ...prev,
          category: value,
          subCategory: "", // Reset dependent field
          attributeValues: [{ attribute: "", value: "" }], // Reset attributes
        };
      } else if (field === "workGroup") {
        return {
          ...prev,
          workGroup: value,
          workTask: "", // Reset dependent field
        };
      } else if (field === "subCategory") {
        return {
          ...prev,
          subCategory: value,
          attributeValues: [{ attribute: "", value: "" }], // Reset attributes
        };
      } else {
        return {
          ...prev,
          [field]: value,
        };
      }
    });
  };

  const renderSelect = (
    label: string,
    value: string,
    field: keyof typeof form,
    options: { _id: string; name: string }[],
    loading: boolean,
    disabled = false,
    onChange?: (
      field: keyof typeof form,
      event: SelectChangeEvent<string>
    ) => void
  ) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) =>
          onChange ? onChange(field, e) : handleChange(field, e.target.value)
        }
        label={label}
        disabled={disabled || loading}
      >
        {loading ? (
          <MenuItem disabled key={`${label}-loading`}>
            <CircularProgress size={20} />
          </MenuItem>
        ) : options.length > 0 ? (
          options.map((opt, index) => (
            <MenuItem
              key={`${label}-${opt._id || `fallback-${index}`}`}
              value={opt._id || ""}
            >
              {opt.name || "Unknown"}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            {label === "SubCategory" && !form.category ? "Select a category first" : 
             label === "Work Task" && !form.workGroup ? "Select a work group first" :
             label === "Attribute" && !form.subCategory ? "Select a subcategory first" :
             `No ${label.toLowerCase()}s found`}
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
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

    try {
      const body = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        brand: form.brand,
        modelName: form.modelName,
        coohomId: form.coohomId,
        description: form.description,
        thumbnail: thumbnail || "string",
        category: form.category,
        subCategory: form.subCategory,
        workGroup: form.workGroup,
        workTask: form.workTask,
        attributeValues: form.attributeValues.map((av) => ({
          attribute: av.attribute,
          value: av.value,
        })),
      };

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
        throw new Error(errorText || "Failed to add product");
      }

      setSuccess("Product added successfully!");
      setTimeout(() => {
        router.push("/admin/product-catalog/products");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong while adding the product.");
    }
  };

  // Define field array with unique keys
  const textFields = [
    { id: "name", label: "Name", type: "text", multiline: false },
    { id: "sku", label: "SKU", type: "text", multiline: false },
    { id: "price", label: "Price", type: "number", multiline: false },
    { id: "brand", label: "Brand", type: "text", multiline: false },
    { id: "modelName", label: "Model Name", type: "text", multiline: false },
    { id: "coohomId", label: "Coohom ID", type: "text", multiline: false },
    { id: "description", label: "Description", type: "text", multiline: false },
    
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        {textFields.map((field) => (
          <Grid item xs={12} sm={6} key={field.id}>
            <TextField
              fullWidth
              label={field.label}
              value={form[field.id as keyof typeof form]}
              onChange={(e) =>
                handleChange(field.id as keyof typeof form, e.target.value)
              }
              type={field.type}
              multiline={field.multiline}
              rows={field.multiline ? 4 : 1}
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {renderSelect(
            "Category",
            form.category,
            "category",
            categories,
            loadingCategories,
            false,
            handleSelectChange
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "SubCategory",
            form.subCategory,
            "subCategory",
            subCategories,
            loadingSubCategories,
            !form.category,
            handleSelectChange
          )}
          
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "Work Group",
            form.workGroup,
            "workGroup",
            workGroups,
            loadingWorkGroups,
            false,
            handleSelectChange
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "Work Task",
            form.workTask,
            "workTask",
            workTasks,
            loadingWorkTasks,
            !form.workGroup,
            handleSelectChange
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {form.attributeValues.map((attr, index) => (
        <Grid
          container
          spacing={2}
          key={`attribute-${index}`}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Grid item xs={12} sm={5}>
            {renderSelect(
              "Attribute",
              attr.attribute,
              "attributeValues",
              attributes,
              loadingAttributes,
              !form.subCategory,
              (_, e) =>
                handleAttributeChange(index, "attribute", e.target.value)
            )}
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Attribute Value"
              value={attr.value}
              onChange={(e) =>
                handleAttributeChange(index, "value", e.target.value)
              }
              disabled={!attr.attribute}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <IconButton
              onClick={() => {
                const newAttrs = [...form.attributeValues];
                newAttrs.splice(index, 1);
                setForm((prev) => ({ ...prev, attributeValues: newAttrs }));
              }}
              disabled={form.attributeValues.length === 1}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button
        onClick={() =>
          setForm((prev) => ({
            ...prev,
            attributeValues: [
              ...prev.attributeValues,
              { attribute: "", value: "" },
            ],
          }))
        }
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Add Attribute
      </Button>

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
          <input
            type="file"
            hidden
            onChange={handleThumbnailChange}
            accept="image/jpeg,image/png"
          />
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

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit}>Submit</ReusableButton>
        <CancelButton href="/admin/product-catalog/products">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
}
