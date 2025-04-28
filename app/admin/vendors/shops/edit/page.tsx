"use client";

import React, { useState, useEffect, useMemo } from "react";
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

const EditShop = () => {
  const router = useRouter();
  const params = useSearchParams();
  const shopId = params.get("id");

  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "Shop@123",
    enabled: true,
    ownerName: "",
    country: "",
    state: "",
    city: "",
    address: "",
    category: "",
    subCategory: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const id = useMemo(() => params.get("id"), [params]);

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch shop data.");
        const shop = await response.json();
        setFormData({
          firstName: shop.firstName || "",
          lastName: shop.lastName || "",
          username: shop.username || "",
          email: shop.email || "",
          phone: shop.phone || "",
          password: "Shop@123",
          enabled: shop.enabled ?? true,
          ownerName: shop.ownerName || "",
          country: shop.country || "",
          state: shop.state || "",
          city: shop.city || "",
          address: shop.address || "",
          category: shop.category || "",
          subCategory: shop.subCategory || "",
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load shop data.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchShop();
  }, [shopId, token, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to update shop.");
      router.push("/admin/vendors/shops");
    } catch (err) {
      console.error(err);
      setError("Failed to update shop.");
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
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Edit New Shop
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Shop Name (Username)"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Phone"
            fullWidth
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Owner Name"
            fullWidth
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Address"
            fullWidth
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleSelectChange}
            >
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Groceries">Groceries</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/vendors/shops">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditShop;
