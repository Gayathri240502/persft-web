"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { SelectChangeEvent } from "@mui/material/Select";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditMerchant = () => {
  const router = useRouter();
  const params = useSearchParams();
  const merchantId = params.get("id");

  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "Merchant@123",
    enabled: true,
    businessName: "",
    address: "",
    category: "",
    subCategory: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  const keycloakId = useMemo(() => searchParams.get("keycloakId"), [searchParams]);

  // Fetch Merchant Details
  useEffect(() => {
    const fetchMerchant = async () => {
      if (!merchantId) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/${keycloakId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch merchant data.");
        const merchant = await response.json();
        setFormData({
          firstName: merchant.firstName || "",
          lastName: merchant.lastName || "",
          username: merchant.username || "",
          email: merchant.email || "",
          phone: merchant.phone || "",
          password: "Merchant@123",
          enabled: merchant.enabled ?? true,
          businessName: merchant.businessName || "",
          address: merchant.address || "",
          category: merchant.category || "",
          subCategory: merchant.subCategory || "",
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load merchant data.");
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories.", err);
      }
    };

    fetchMerchant();
    fetchCategories();
  }, [merchantId, token]);

  // Fetch SubCategories When Category Changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.category) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${formData.category}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch sub-categories.");
        const data = await response.json();
        setSubCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch sub-categories.", err);
      }
    };

    fetchSubCategories();
  }, [formData.category, token]);

  // Handle Form Input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submit
  const handleSubmit = async () => {
    if (!merchantId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${keycloakId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to update merchant.");
      router.push("/admin/vendors/merchants");
    } catch (err) {
      console.error(err);
      setError("Failed to update merchant.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Merchant
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {[
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "username", label: "Username" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          { name: "businessName", label: "Business Name" },
          { name: "address", label: "Address" },
          { name: "password", label: "Password" },
        ].map(({ name, label }) => (
          <Grid item xs={12} md={6} key={name}>
            <TextField
              fullWidth
              label={label}
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleInputChange}
            />
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleSelectChange}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Sub Category</InputLabel>
            <Select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleSelectChange}
              label="Sub Category"
              disabled={!formData.category}
            >
              {subCategories.map((sub) => (
                <MenuItem key={sub._id} value={sub._id}>
                  {sub.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/vendors/merchants">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default EditMerchant;
