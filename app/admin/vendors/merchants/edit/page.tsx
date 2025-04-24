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
import { SelectChangeEvent } from "@mui/material/Select";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
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

  useEffect(() => {
    const fetchMerchant = async () => {
      if (!merchantId) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/${merchantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch merchant data.");
        const data = await res.json();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          businessName: data.businessName || "",
          address: data.address || "",
          category: data.category || "",
          subCategory: data.subCategory || "",
        });
      } catch {
        setError("Unable to load merchant data.");
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        console.error("Failed to fetch categories.");
      }
    };

    fetchMerchant();
    fetchCategories();
  }, [merchantId, token]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.category) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${formData.category}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setSubCategories(data.categories || []);
      } catch {
        console.error("Failed to fetch sub-categories.");
      }
    };

    fetchSubCategories();
  }, [formData.category, token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    }));
  };

  const handleSubmit = async () => {
    if (!merchantId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${merchantId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Update failed.");
      router.push("/admin/vendors/merchants");
    } catch {
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
          ["firstName", "First Name"],
          ["lastName", "Last Name"],
          ["username", "Username"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["businessName", "Business Name"],
          ["address", "Address"],
        ].map(([name, label]) => (
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
