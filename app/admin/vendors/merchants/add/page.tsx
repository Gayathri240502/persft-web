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
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddMerchant = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    address: "",
    category: "",
    subCategory: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
      ...(name === "category" && { subCategory: "" }), // Reset subCategory if category changes
    }));
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetched categories:", data);
      setCategories(data.categories || data || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) return;

    setSubCategoriesLoading(true); // Set loading to true before fetching sub-categories
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/categories-selection`, // Corrected endpoint for sub-categories
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Fetched sub-categories:", data);
      setSubCategories(data.categories || data || []); // Assuming the response contains 'categories' field for sub-categories
    } catch (err) {
      console.error("Error fetching sub-categories", err);
    } finally {
      setSubCategoriesLoading(false); // Set loading to false once data is fetched
    }
  };

  useEffect(() => {
    console.log("Fetching categories...");
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
    }
  }, [formData.category]); // Fetch sub-categories when category changes

  const handleSubmit = async () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "password",
      "businessName",
      "address",
      "category",
      "subCategory",
    ];

    const missing = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missing.length > 0) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants`,
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create merchant.");
      }

      router.push("/admin/vendors/merchants");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add Merchant Details
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {[
          { label: "First Name", name: "firstName" },
          { label: "Last Name", name: "lastName" },
          { label: "Username", name: "username" },
          { label: "Email", name: "email" },
          { label: "Phone", name: "phone" },
          { label: "Password", name: "password", type: "password" },
          { label: "Business Name", name: "businessName" },
          { label: "Address", name: "address" },
        ].map(({ label, name, type = "text" }) => (
          <Grid item xs={12} key={name}>
            <TextField
              label={label}
              name={name}
              type={type}
              fullWidth
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Sub-Category</InputLabel>
            <Select
              name="subCategory"
              value={formData.subCategory}
              label="Sub-Category"
              onChange={handleChange}
              disabled={!formData.category || subCategoriesLoading}
            >
              {subCategoriesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : subCategories.length === 0 ? (
                <MenuItem disabled>No sub-categories available</MenuItem>
              ) : (
                subCategories.map((sub) => (
                  <MenuItem key={sub._id} value={sub._id}>
                    {sub.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/vendors/merchants">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddMerchant;
