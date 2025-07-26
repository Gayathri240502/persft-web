"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
  SelectChangeEvent,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddMerchant = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { subCategory: "" }), // Reset sub-category when category changes
    }));

    // Fetch sub-categories only if a category is selected
    if (name === "category" && value) {
      fetchSubCategories(value);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Categories Response:", data);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) return;

    setSubCategoriesLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/subcategories/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Subcategories Response:", data);
      setSubCategories(data.subCategories || []);
    } catch (err) {
      console.error("Error fetching sub-categories", err);
    } finally {
      setSubCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
    }
  }, [formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/vendors/merchants");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error submitting form", err);
      setError("Failed to submit the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label="Merchants" />

      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add Merchant Details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                type="password"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleSelectChange}
                  name="category"
                  label="Category"
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No categories available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>SubCategory</InputLabel>
                <Select
                  value={formData.subCategory}
                  onChange={handleSelectChange}
                  name="subCategory"
                  label="SubCategory"
                  disabled={!formData.category}
                >
                  {subCategoriesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : subCategories.length > 0 ? (
                    subCategories.map((subCategory) => (
                      <MenuItem key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No subcategories available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" loading={loading}>
              Submit
            </ReusableButton>
            <CancelButton href="/admin/vendors/merchants">
              {" "}
              Cancel{" "}
            </CancelButton>
          </Box>
        </form>
      </Box>
    </>
  );
};

export default AddMerchant;
