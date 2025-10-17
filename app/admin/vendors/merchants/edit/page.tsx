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
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectChangeEvent } from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";

interface Contact {
  name: string;
  mobile: string;
  email: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  branch: string;
}

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
  pincode: string;
  state: string;
  country: string;
  typeOfEntity: string;
  panNumber: string;
  gstNumber: string;
  authorizedSignatory: Contact;
  accountsContact: Contact;
  deliveryContact: Contact;
  bankAccountDetails: BankDetails;
  gstPercentage: number;
  otherTaxes: number;
  packagingCharges: number;
  insuranceCharges: number;
  deliveryCharges: number;
  installationCharges: number;
}

const EditMerchant = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useTokenAndRole();

  const merchantId = useMemo(() => searchParams.get("id"), [searchParams]);
  const keycloakId = useMemo(() => searchParams.get("keycloakId"), [searchParams]);
  const missingId = !merchantId && !keycloakId;

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
    pincode: "",
    state: "",
    country: "",
    typeOfEntity: "",
    panNumber: "",
    gstNumber: "",
    authorizedSignatory: { name: "", mobile: "", email: "" },
    accountsContact: { name: "", mobile: "", email: "" },
    deliveryContact: { name: "", mobile: "", email: "" },
    bankAccountDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      branch: "",
    },
    gstPercentage: 0,
    otherTaxes: 0,
    packagingCharges: 0,
    insuranceCharges: 0,
    deliveryCharges: 0,
    installationCharges: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMerchant, setLoadingMerchant] = useState(true);

  // FETCH merchant details
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

        if (!response.ok) throw new Error("Failed to fetch merchant");
        const data = await response.json();
        const merchant = data.merchant || data;

        setFormData((prev) => ({
          ...prev,
          ...merchant,
          authorizedSignatory: merchant.authorizedSignatory || prev.authorizedSignatory,
          accountsContact: merchant.accountsContact || prev.accountsContact,
          deliveryContact: merchant.deliveryContact || prev.deliveryContact,
          bankAccountDetails: merchant.bankAccountDetails || prev.bankAccountDetails,
        }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingMerchant(false);
      }
    };

    fetchMerchant();
  }, [merchantId, keycloakId, token, missingId]);

  // FETCH categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/categories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCategories();
  }, [token]);

  // FETCH subcategories
  useEffect(() => {
    if (!formData.category) return;
    const fetchSubCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/subcategories/${formData.category}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setSubCategories(data.subCategories || []);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchSubCategories();
  }, [formData.category, token]);

  // Handle input changes (supports nested fields)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    const nestedPath = name.split(".");
    if (nestedPath.length === 2) {
      const [parent, child] = nestedPath;
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const id = keycloakId || merchantId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update merchant");

      router.push("/admin/vendors/merchants");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMerchant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading merchant data...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Edit Merchant" />
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Edit Merchant Details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>{/* Each Field */}</Grid>

          {[
            "firstName",
            "lastName",
            "username",
            "email",
            "phone",
            "businessName",
            "address",
            "pincode",
            "state",
            "country",
            "typeOfEntity",
            "panNumber",
            "gstNumber",
          ].map((field) => (
            <Grid item xs={12} md={6} key={field}>
              <TextField
                fullWidth
                label={field.replace(/([A-Z])/g, " $1")}
                name={field}
                value={(formData as any)[field] || ""}
                onChange={handleChange}
              />
            </Grid>
          ))}

          {/* Category Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={formData.category} onChange={handleChange}>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Subcategory Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sub Category</InputLabel>
              <Select name="subCategory" value={formData.subCategory} onChange={handleChange}>
                {subCategories.map((sc) => (
                  <MenuItem key={sc._id} value={sc._id}>
                    {sc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Authorized Signatory</Typography>
          </Grid>

          {["name", "mobile", "email"].map((key) => (
            <Grid item xs={12} md={4} key={key}>
              <TextField
                fullWidth
                label={key}
                name={`authorizedSignatory.${key}`}
                value={formData.authorizedSignatory[key as keyof Contact]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Accounts Contact</Typography>
          </Grid>

          {["name", "mobile", "email"].map((key) => (
            <Grid item xs={12} md={4} key={key}>
              <TextField
                fullWidth
                label={key}
                name={`accountsContact.${key}`}
                value={formData.accountsContact[key as keyof Contact]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Delivery Contact</Typography>
          </Grid>

          {["name", "mobile", "email"].map((key) => (
            <Grid item xs={12} md={4} key={key}>
              <TextField
                fullWidth
                label={key}
                name={`deliveryContact.${key}`}
                value={formData.deliveryContact[key as keyof Contact]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Bank Account Details</Typography>
          </Grid>

          {Object.keys(formData.bankAccountDetails).map((key) => (
            <Grid item xs={12} md={6} key={key}>
              <TextField
                fullWidth
                label={key}
                name={`bankAccountDetails.${key}`}
                value={(formData.bankAccountDetails as any)[key]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Charges & Taxes</Typography>
          </Grid>

          {[
            "gstPercentage",
            "otherTaxes",
            "packagingCharges",
            "insuranceCharges",
            "deliveryCharges",
            "installationCharges",
          ].map((key) => (
            <Grid item xs={12} md={4} key={key}>
              <TextField
                fullWidth
                label={key.replace(/([A-Z])/g, " $1")}
                type="number"
                name={key}
                value={(formData as any)[key]}
                onChange={handleChange}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />
        <Box sx={{ display: "flex", gap: 2 }}>
          <ReusableButton onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Update"}
          </ReusableButton>
          <CancelButton href="/admin/vendors/merchants">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default EditMerchant;
