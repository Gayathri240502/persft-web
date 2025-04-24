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
} from "@mui/material";
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

const AddShop = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    ownerName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    category: "",
    subCategory: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { token } = getTokenAndRole();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        setCategories(data.categories || data || []);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(err.message || "Failed to fetch categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchSubCategories = async () => {
      setLoadingSubCategories(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch subcategories");
        }

        const data = await res.json();
        setSubCategories(data.subCategories || data || []);
      } catch (err: any) {
        console.error("Error fetching subcategories:", err);
        setError(err.message || "Failed to fetch subcategories.");
      } finally {
        setLoadingSubCategories(false);
      }
    };

    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/countries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch countries");
        }

        const data = await res.json();
        setCountries(data.countries || data || []);
      } catch (err: any) {
        console.error("Error fetching countries:", err);
        setError(err.message || "Failed to fetch countries.");
      } finally {
        setLoadingCountries(false);
      }
    };

    const fetchStates = async (countryId: string) => {
      if (!countryId) return;
      
      setLoadingStates(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/states?countryId=${countryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch states");
        }

        const data = await res.json();
        setStates(data.states || data || []);
      } catch (err: any) {
        console.error("Error fetching states:", err);
        setError(err.message || "Failed to fetch states.");
      } finally {
        setLoadingStates(false);
      }
    };

    const fetchCities = async (stateId: string) => {
      if (!stateId) return;
      
      setLoadingCities(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities?stateId=${stateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch cities");
        }

        const data = await res.json();
        setCities(data.cities || data || []);
      } catch (err: any) {
        console.error("Error fetching cities:", err);
        setError(err.message || "Failed to fetch cities.");
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCategories();
    fetchSubCategories();
    fetchCountries();
  }, [token]);

  useEffect(() => {
    if (form.country) {
      fetchStates(form.country);
    } else {
      setStates([]);
      setForm((prev) => ({ ...prev, state: "", city: "" }));
    }
  }, [form.country]);

  useEffect(() => {
    if (form.state) {
      fetchCities(form.state);
    } else {
      setCities([]);
      setForm((prev) => ({ ...prev, city: "" }));
    }
  }, [form.state]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add shop: ${errorText}`);
      }

      await res.json();
      setSuccess("Shop added successfully!");
      setForm({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        ownerName: "",
        address: "",
        country: "",
        state: "",
        city: "",
        category: "",
        subCategory: "",
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Something went wrong while adding the shop.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Add New Shop
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Grid container spacing={2}>
        {[{ label: "First Name", key: "firstName" },
          { label: "Last Name", key: "lastName" },
          { label: "Username", key: "username" },
          { label: "Email", key: "email" },
          { label: "Phone", key: "phone" },
          { label: "Password", key: "password" },
          { label: "Owner Name", key: "ownerName" },
          { label: "Address", key: "address" },
          { label: "Category", key: "category" },
          { label: "SubCategory", key: "subCategory" },
        ].map(({ label, key }) => (
          <Grid item xs={12} sm={6} key={key}>
            <TextField
              fullWidth
              label={label}
              value={form[key as keyof typeof form]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={form.country}
              onChange={(e: SelectChangeEvent) => handleChange("country", e.target.value)}
              label="Country"
            >
              {loadingCountries ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : countries.length > 0 ? (
                countries.map((country) => (
                  <MenuItem key={country._id} value={country._id}>
                    {country.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No countries found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              value={form.state}
              onChange={(e: SelectChangeEvent) => handleChange("state", e.target.value)}
              label="State"
              disabled={!form.country}
            >
              {loadingStates ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : states.length > 0 ? (
                states.map((state) => (
                  <MenuItem key={state._id} value={state._id}>
                    {state.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No states found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              value={form.city}
              onChange={(e: SelectChangeEvent) => handleChange("city", e.target.value)}
              label="City"
              disabled={!form.state}
            >
              {loadingCities ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : cities.length > 0 ? (
                cities.map((city) => (
                  <MenuItem key={city._id} value={city._id}>
                    {city.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No cities found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit}>Submit</ReusableButton>
        <CancelButton href="/admin/vendors/shops">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddShop;
