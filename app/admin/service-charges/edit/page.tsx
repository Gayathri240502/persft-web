"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { SelectChangeEvent } from "@mui/material";

interface ServiceCharge {
  name: string;
  type: string;
  calculationMethod: string;
  value?: string | number;
  perSqftRate?: string | number;
  pricing: { [key: string]: number | string };
  percentageBase: string;
  description: string;
  remarks: string;
  isActive: boolean;
  displayOrder: number;
}

interface TypeOption {
  value: string;
  label: string;
}

const EditServiceCharge = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { token } = useTokenAndRole();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [types, setTypes] = useState<TypeOption[]>([]);
  const [methods, setMethods] = useState<{ name: string; description?: string }[]>([]);
  const [pricingKeys, setPricingKeys] = useState<string[]>([]);

  const [formData, setFormData] = useState<ServiceCharge>({
    name: "",
    type: "",
    calculationMethod: "",
    value: "",
    perSqftRate: "",
    pricing: {},
    percentageBase: "",
    description: "",
    remarks: "",
    isActive: true,
    displayOrder: 1,
  });

  
  const fetchDropdowns = async () => {
    try {
      const [typesRes, methodsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges/types`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges/calculation-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (typesRes.status === 429 || methodsRes.status === 429) {
        setError("Too many requests. Please wait and try again.");
        return;
      }

      const typesData = await typesRes.json();
      const methodsData = await methodsRes.json();

      const typesObjects: TypeOption[] = typesData.map((t: string | TypeOption) =>
        typeof t === "string" ? { value: t, label: t } : t
      );

      const uniqueTypes = Array.from(new Map(typesObjects.map(t => [t.value, t])).values());

      setTypes(uniqueTypes);
      setMethods(methodsData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dropdowns");
    }
  };

  
  const fetchData = async () => {
    if (!id || !token) return;

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait and try again.");
        return;
      }

      if (!res.ok) throw new Error("Failed to load data");

      const data = await res.json();

      setFormData({
        name: data.name || "",
        type: data.type || "",
        calculationMethod: data.calculationMethod || "",
        value: data.value || "",
        perSqftRate: data.perSqftRate || "",
        pricing: data.pricing || {},
        percentageBase: data.percentageBase || "",
        description: data.description || "",
        remarks: data.remarks || "",
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder || 1,
      });

      setPricingKeys(Object.keys(data.pricing || {}));
    } catch (err) {
      console.error(err);
      if (!error) setError("Failed to load service charge data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handlePricingChange = (key: string, value: string | number) => {
    setFormData({
      ...formData,
      pricing: { ...formData.pricing, [key]: value },
    });
  };

  // -------------------------------
  // Submit update (PUT)
  // -------------------------------
  const handleSubmit = async () => {
    if (!id || !token) return;

    if (!formData.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (formData.calculationMethod === "per_sqft" && !formData.perSqftRate?.toString().trim()) {
      setError("Per Sqft Rate is required for per_sqft calculation method");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: any = { ...formData };
      
      // Explicitly convert numeric fields to Number
      if (payload.value !== undefined && payload.value !== null && payload.value !== "") {
        payload.value = Number(payload.value);
      }
      if (payload.perSqftRate !== undefined && payload.perSqftRate !== null && payload.perSqftRate !== "") {
        payload.perSqftRate = Number(payload.perSqftRate);
      }
      if (payload.displayOrder !== undefined && payload.displayOrder !== null && payload.displayOrder !== "") {
        payload.displayOrder = Number(payload.displayOrder);
      }
      
      if (formData.calculationMethod !== "per_sqft") {
        delete payload.perSqftRate;
      }
      
      // Clean up pricing values (convert to number)
      const cleanPricing: { [key: string]: number } = {};
      for (const key in payload.pricing) {
          cleanPricing[key] = Number(payload.pricing[key]);
      }
      payload.pricing = cleanPricing;


      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait and try again.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Update failed");
      }

      router.push("/admin/service-charges");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------
  // Load initial data
  // -------------------------------
  useEffect(() => {
    if (token && id) {
      const timer = setTimeout(() => {
        fetchDropdowns();
        fetchData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [token, id]);

  // Helper function for rendering Select to match EditKiosk style
  const renderSelect = (
    label: string,
    value: string,
    name: keyof ServiceCharge,
    options: { value: string | number; label: string }[]
  ) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select 
        name={name} 
        value={value} 
        label={label} 
        onChange={handleChange as (event: SelectChangeEvent<string>) => void}
      >
        {options.map((opt, idx) => (
          <MenuItem key={`${opt.value}-${idx}`} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  if (loading) {
    return (
      <Box p={3}>
        <Navbar label="Edit Service Charge" />
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "300px" 
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading service charge data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Edit Service Charge" />

      <Box p={3} maxWidth="1500px" margin="auto">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h5" sx={{ mb: 3 }}>
          Edit Service Charge
        </Typography>

        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              // Removed custom height props to match Edit Kiosk style
              sx={{ mb: 2 }} 
            />
          </Grid>
          
          {/* Type - Uses renderSelect for consistent style */}
          <Grid item xs={12} md={6}>
            {renderSelect(
              "Type",
              formData.type,
              "type",
              types
            )}
          </Grid>

          {/* Calculation Method - Uses renderSelect for consistent style */}
          <Grid item xs={12} md={6}>
            {renderSelect(
              "Calculation Method",
              formData.calculationMethod,
              "calculationMethod",
              methods.map(m => ({ value: m.name, label: m.description || m.name }))
            )}
          </Grid>
          
          {/* Value */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Value"
              name="value"
              fullWidth
              value={formData.value}
              onChange={handleChange}
              // Removed custom height props to match Edit Kiosk style
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Per Sqft Rate if applicable */}
          {formData.calculationMethod === "per_sqft" && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Per Sqft Rate"
                name="perSqftRate"
                fullWidth
                value={formData.perSqftRate}
                onChange={handleChange}
                // Removed custom height props to match Edit Kiosk style
                sx={{ mb: 2 }}
              />
            </Grid>
          )}

          {/* Display Order + Active */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Display Order"
              name="displayOrder"
              type="number"
              fullWidth
              value={formData.displayOrder}
              onChange={handleChange}
              // Removed custom height props to match Edit Kiosk style
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  name="isActive"
                />
              }
              label="Active"
              sx={{ mt: 1 }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
              // Removed custom InputProps/sx for font size
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Remarks */}
          <Grid item xs={12}>
            <TextField
              label="Remarks"
              name="remarks"
              fullWidth
              multiline
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              // Removed custom InputProps/sx for font size
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Dynamic Pricing */}
          {pricingKeys.map((key) => (
            <Grid item xs={12} md={6} key={key}>
              <TextField
                label={`Pricing for ${key}`}
                type="number"
                fullWidth
                value={formData.pricing[key]}
                onChange={(e) => handlePricingChange(key, e.target.value)}
                // Removed custom height props to match Edit Kiosk style
                sx={{ mb: 2 }}
              />
            </Grid>
          ))}
        </Grid>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            // fullWidth
            disabled={saving}
            onClick={handleSubmit}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default EditServiceCharge;