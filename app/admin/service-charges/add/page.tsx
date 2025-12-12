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
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { SelectChangeEvent } from "@mui/material";

interface ServiceChargeForm {
  code: string;
  name: string;
  type: string;
  calculationMethod: string;
  perSqftRate?: string | number;
  pricing: { [key: string]: number | string };
  percentageBase: string;
  description: string;
  remarks: string;
  isActive: boolean;
  displayOrder: number;
}

interface Option {
  label: string;
}

const AddServiceCharge = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [formData, setFormData] = useState<ServiceChargeForm>({
    code: "",
    name: "",
    type: "",
    calculationMethod: "flat_rate",
    perSqftRate: "",
    pricing: {},
    percentageBase: "proposal_value",
    description: "",
    remarks: "",
    isActive: true,
    displayOrder: 1,
  });

  const [types, setTypes] = useState<Option[]>([]);
  const [methods, setMethods] = useState<Option[]>([]);
  const [loadingEnums, setLoadingEnums] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapToOption = (m: any): Option => {
    if (typeof m === "string") return { value: m, label: m };
    const value = m.value ?? m.name ?? "";
    const label = m.label ?? m.description ?? m.name ?? value;
    return { value, label };
  };

  const fetchDropdowns = async () => {
    if (!token) return;
    setLoadingEnums(true);
    setError(null);

    try {
      const [typesRes, methodsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges/types`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges/calculation-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!typesRes.ok) {
        const txt = await typesRes.text();
        throw new Error(`Failed to load types: ${typesRes.status} ${txt}`);
      }
      if (!methodsRes.ok) {
        const txt = await methodsRes.text();
        throw new Error(`Failed to load calculation methods: ${methodsRes.status} ${txt}`);
      }

      const typesData = await typesRes.json();
      const methodsData = await methodsRes.json();

      const typesObjects: Option[] = (typesData || []).map(mapToOption);
      const uniqueTypes = Array.from(new Map(typesObjects.map((t) => [t.value, t])).values());

      const methodsObjects: Option[] = (methodsData || []).map(mapToOption);

      if (!methodsObjects.length) {
        throw new Error("No calculation methods returned from server");
      }

      setTypes(uniqueTypes);
      setMethods(methodsObjects);

      const currentMethodValue = formData.calculationMethod;
      const hasCurrent = methodsObjects.some((m) => m.value === currentMethodValue);
      if (!hasCurrent) {
        setFormData((prev) => ({ ...prev, calculationMethod: methodsObjects[0].value }));
      }
    } catch (err: any) {
      console.error("fetchDropdowns error:", err);
      setError(err?.message || "Failed to load dropdowns");
    } finally {
      setLoadingEnums(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as any;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handlePricingChange = (key: string, value: string | number) => {
    setFormData({ ...formData, pricing: { ...formData.pricing, [key]: value } });
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!formData.code.trim() || !formData.name.trim() || !formData.type || !formData.calculationMethod) {
      setError("Please fill all required fields");
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

      if (payload.perSqftRate !== undefined && payload.perSqftRate !== "") payload.perSqftRate = Number(payload.perSqftRate);
      if (payload.displayOrder !== undefined && payload.displayOrder !== "") payload.displayOrder = Number(payload.displayOrder);

      if (formData.calculationMethod !== "per_sqft") delete payload.perSqftRate;

      const cleanPricing: { [key: string]: number } = {};
      for (const key in payload.pricing) {
        const num = Number(payload.pricing[key]);
        if (!Number.isNaN(num)) cleanPricing[key] = num;
      }
      payload.pricing = cleanPricing;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-charges`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      let data;
      try { data = resText ? JSON.parse(resText) : {}; } catch { data = { message: resText }; }

      if (!res.ok) {
        throw new Error(data.message || `Failed to create service charge (${res.status})`);
      }

      router.push("/admin/service-charges");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    name: keyof ServiceChargeForm,
    options: Option[]
  ) => (
    <FormControl fullWidth sx={{ mb: 2 }} disabled={loadingEnums}>
      <InputLabel>{label}</InputLabel>
      <Select
        name={name as string}
        value={value ?? ""}
        label={label}
        onChange={handleChange as any}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((opt, idx) => (
          <MenuItem key={`${opt.value}-${idx}`} value={opt.value ?? ""}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <>
      <Navbar label="Add Service Charge" />
      <Box p={3} maxWidth="1600px" margin="auto">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="h5" sx={{ mb: 3 }}>Add New Service Charge</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Code"
              name="code"
              fullWidth
              value={formData.code}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            {renderSelect("Type", formData.type, "type", types)}
          </Grid>

          <Grid item xs={12} md={6}>
            {renderSelect("Calculation Method", formData.calculationMethod, "calculationMethod", methods)}
          </Grid>

          <Grid item xs={12} md={6}>
            {/* <TextField
              label="Value"
              name="value"
              fullWidth
              value={formData.value}
              onChange={handleChange}
              sx={{ mb: 2 }}
            /> */}
          </Grid>

          {formData.calculationMethod === "per_sqft" && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Per Sqft Rate"
                name="perSqftRate"
                fullWidth
                value={formData.perSqftRate}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            {renderSelect(
              "Percentage Base",
              formData.percentageBase,
              "percentageBase",
              [
                { value: "proposal_value", label: "Proposal Value" },
                { value: "total_cost", label: "Total Cost" },
              ]
            )}
          </Grid>

          <Grid item xs={12} md={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Pricing</Typography>
            {["2bhk", "3bhk"].map((unit) => (
              <TextField
                key={unit}
                label={unit.toUpperCase()}
                value={formData.pricing[unit] ?? ""}
                onChange={(e) => handlePricingChange(unit, e.target.value)}
                type="number"
                sx={{ mb: 2, mr: 2, width: "200px" }}
              />
            ))}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Display Order"
              name="displayOrder"
              type="number"
              fullWidth
              value={formData.displayOrder}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox checked={formData.isActive} onChange={handleCheckboxChange} name="isActive" />}
              label="Active"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Remarks"
              name="remarks"
              fullWidth
              multiline
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            disabled={saving}
            onClick={handleSubmit}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Saving..." : "Submit"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default AddServiceCharge;
