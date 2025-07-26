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
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation"; // <-- import useRouter
import Navbar from "@/app/components/navbar/navbar";

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
  const router = useRouter(); // <-- initialize router

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

  const { token } = useTokenAndRole();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const res1 = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data1 = await res1.json();
        setCategories(data1.categories || data1 || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingSubCategories(true);
        const res2 = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data2 = await res2.json();
        setSubCategories(data2.subCategories || data2 || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch subcategories.");
      } finally {
        setLoadingSubCategories(false);
      }

      try {
        setLoadingCountries(true);
        const res3 = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/dropdown/countries`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data3 = await res3.json();
        setCountries(data3.countries || data3 || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch countries.");
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchStates = async () => {
      if (!form.country) return;
      try {
        setLoadingStates(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/dropdown/states/${form.country}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setStates(data.states || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch states.");
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, [form.country, token]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!form.state) return;
      try {
        setLoadingCities(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shops/dropdown/cities/${form.state}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setCities(data.cities || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch cities.");
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [form.state, token]);

  const handleChange = (field: keyof typeof form, value: string) => {
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
        throw new Error(errorText || "Failed to add shop");
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

      router.push("/admin/vendors/shops"); // <-- Redirect after success
    } catch (err: any) {
      setError(err.message || "Something went wrong while adding the shop.");
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    field: keyof typeof form,
    options: { _id: string; name: string }[],
    loading: boolean,
    disabled = false
  ) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e: SelectChangeEvent) => handleChange(field, e.target.value)}
        label={label}
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
    <>
      <Navbar label="Shop" />

      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Add New Shop
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Grid container spacing={2}>
          {[
            ["First Name", "firstName"],
            ["Last Name", "lastName"],
            ["Username", "username"],
            ["Email", "email"],
            ["Phone", "phone"],
            ["Password", "password"],
            ["Owner Name", "ownerName"],
            ["Address", "address"],
          ].map(([label, key]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={label}
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  handleChange(key as keyof typeof form, e.target.value)
                }
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6}>
            {renderSelect(
              "Category",
              form.category,
              "category",
              categories,
              loadingCategories
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "SubCategory",
              form.subCategory,
              "subCategory",
              subCategories,
              loadingSubCategories
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "Country",
              form.country,
              "country",
              countries,
              loadingCountries
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "State",
              form.state,
              "state",
              states,
              loadingStates,
              !form.country
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "City",
              form.city,
              "city",
              cities,
              loadingCities,
              !form.state
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit}>Submit</ReusableButton>
          <CancelButton href="/admin/vendors/shops">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default AddShop;
