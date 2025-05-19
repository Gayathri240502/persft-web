"use client";

import React, { useState, useEffect } from "react";
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
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectChangeEvent } from "@mui/material/Select";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Category {
  _id: string;
  name: string;
}
interface SubCategory {
  _id: string;
  name: string;
}
interface Country {
  _id: string;
  name: string;
}
interface State {
  _id: string;
  name: string;
}
interface City {
  _id: string;
  name: string;
}

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

  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) return;
      console.log("Fetching shop with ID:", shopId); // ✅ Debug
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("Fetched shop data:", data); // ✅ Debug

        const shop = data.shop ?? data;

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
  }, [shopId, token]);

  // Fetch categories and countries on load
  useEffect(() => {
    const fetchInitialDropdowns = async () => {
      try {
        const [catRes, subCatRes, countryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/dropdown/countries`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catRes.ok) throw new Error("Failed to fetch categories.");
        if (!subCatRes.ok) throw new Error("Failed to fetch subcategories.");
        if (!countryRes.ok) throw new Error("Failed to fetch countries.");

        const catData = await catRes.json();
        const subCatData = await subCatRes.json();
        const countryData = await countryRes.json();

        setCategories(catData.categories || catData || []);
        setSubCategories(subCatData.subCategories || subCatData || []);
        setCountries(countryData.countries || countryData || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dropdown data.");
      }
    };

    fetchInitialDropdowns();
  }, [token]);

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country) {
        setStates([]);
        setFormData((prev) => ({ ...prev, state: "", city: "" }));
        return;
      }
      try {
        setLoadingStates(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/dropdown/states/${formData.country}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch states.");
        const data = await res.json();
        setStates(data.states || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch states.");
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [formData.country, token]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) {
        setCities([]);
        setFormData((prev) => ({ ...prev, city: "" }));
        return;
      }
      try {
        setLoadingCities(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/dropdown/cities/${formData.state}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch cities.");
        const data = await res.json();
        setCities(data.cities || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch cities.");
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [formData.state, token]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    // Clear dependent dropdowns when parent changes
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        country: value,
        state: "",
        city: "",
      }));
    } else if (name === "state") {
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit updated shop data
  const handleSubmit = async () => {
    if (!shopId) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops/${shopId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update shop.");
      }
      router.push("/admin/vendors/shops");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update shop.");
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

  const renderSelect = (
    label: string,
    name: keyof typeof formData,
    value: string,
    options: { _id: string; name: string }[],
    loading = false,
    disabled = false
  ) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={handleSelectChange}
        disabled={disabled}
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
        Edit Shop
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            fullWidth
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            fullWidth
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Shop Name (Username)"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone"
            fullWidth
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "Category",
            "category",
            formData.category,
            categories,
            false
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "SubCategory",
            "subCategory",
            formData.subCategory,
            subCategories,
            false
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "Country",
            "country",
            formData.country,
            countries,
            false
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "State",
            "state",
            formData.state,
            states,
            loadingStates,
            !formData.country
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {renderSelect(
            "City",
            "city",
            formData.city,
            cities,
            loadingCities,
            !formData.state
          )}
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.enabled}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  enabled: e.target.checked,
                }))
              }
            />
          }
          label={formData.enabled ? "Active" : "Inactive"}
        />
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
