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
  Button,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectChangeEvent } from "@mui/material";
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

interface MerchantForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  enabled: boolean;
  businessName: string;
  address: string;
  category: string;
  subCategory: string;
}

const EditMerchant = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();

  const merchantId = useMemo(() => searchParams.get("id"), [searchParams]);
  const keycloakId = useMemo(
    () => searchParams.get("keycloakId"),
    [searchParams]
  );

  const [formData, setFormData] = useState<MerchantForm>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    enabled: true,
    businessName: "",
    address: "",
    category: "",
    subCategory: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingMerchant, setLoadingMerchant] = useState(true);

  const missingId = !merchantId && !keycloakId;

  useEffect(() => {
    if (missingId) return;

    const fetchMerchant = async () => {
      try {
        setLoadingMerchant(true);
        const id = keycloakId || merchantId;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch merchant");
        }

        const responseData = await response.json();
        const rawMerchant = responseData.merchant || responseData;
        const merchant = rawMerchant._doc
          ? { ...rawMerchant._doc, ...rawMerchant }
          : rawMerchant;

        setFormData({
          firstName: merchant.firstName || "",
          lastName: merchant.lastName || "",
          username: merchant.username || "",
          email: merchant.email || "",
          phone: merchant.phone || "",
          password: "",
          enabled: merchant.enabled ?? true,
          businessName: merchant.businessName || "",
          address: merchant.address || "",
          category: merchant.category || "",
          subCategory: merchant.subCategory || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingMerchant(false);
      }
    };

    fetchMerchant();
  }, [merchantId, keycloakId, token, missingId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (!formData.category) {
      setSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategory: "" }));
      return;
    }

    const fetchSubCategories = async () => {
      try {
        setLoadingSubCategories(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/subcategories/${formData.category}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch subcategories");
        }

        const data = await response.json();
        setSubCategories(data.subCategories || data.categories || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [formData.category, token]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (missingId) {
      setError("No merchant ID or Keycloak ID provided");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      const id = keycloakId || merchantId;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update merchant");
      }

      router.push("/admin/vendors/merchants");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTextField = (label: string, name: keyof MerchantForm) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />
  );

  const renderSelect = (
    label: string,
    value: string,
    name: keyof MerchantForm,
    options: { _id: string; name: string }[],
    loading = false,
    disabled = false
  ) => (
    <FormControl fullWidth sx={{ mb: 2 }} disabled={disabled || loading}>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value} label={label} onChange={handleChange}>
        {loading ? (
          <MenuItem disabled>Loading...</MenuItem>
        ) : options.length === 0 ? (
          <MenuItem disabled>No {label.toLowerCase()} available</MenuItem>
        ) : (
          options.map((opt) => (
            <MenuItem key={opt._id} value={opt._id}>
              {opt.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );

  // Render error if ID is missing
  if (missingId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          No merchant ID or Keycloak ID provided. Please select a valid
          merchant.
        </Alert>
        <CancelButton href="/admin/vendors/merchants">
          Back to Merchants
        </CancelButton>
      </Box>
    );
  }

  if (loadingMerchant) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress size={24} />
        <Typography sx={{ ml: 2 }}>Loading merchant data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Merchant
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderTextField("First Name", "firstName")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Last Name", "lastName")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Username", "username")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Email", "email")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Phone", "phone")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Password", "password")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Business Name", "businessName")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTextField("Address", "address")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSelect(
            "Category",
            formData.category,
            "category",
            categories,
            loadingCategories
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSelect(
            "Sub Category",
            formData.subCategory,
            "subCategory",
            subCategories,
            loadingSubCategories,
            !formData.category
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/vendors/merchants">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditMerchant;
