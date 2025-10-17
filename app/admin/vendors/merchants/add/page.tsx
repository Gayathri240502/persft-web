"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddMerchant = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
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
    authorizedSignatory: {
      name: "",
      mobile: "",
      email: "",
    },
    accountsContact: {
      name: "",
      mobile: "",
      email: "",
    },
    deliveryContact: {
      name: "",
      mobile: "",
      email: "",
    },
    bankAccountDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      branch: "",
    },
    gstPercentage: "",
    otherTaxes: "",
    packagingCharges: "",
    insuranceCharges: "",
    deliveryCharges: "",
    installationCharges: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Fixed TypeScript-safe nested change handler
  const handleNestedChange = (
    section: keyof typeof formData,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { subCategory: "" }),
    }));

    if (name === "category" && value) {
      fetchSubCategories(value);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) return;
    setSubCategoriesLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/dropdown/subcategories/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setSubCategories(data.subCategories || []);
    } catch (err) {
      console.error("Error fetching sub-categories", err);
    } finally {
      setSubCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) fetchSubCategories(formData.category);
  }, [formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/vendors/merchants");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error submitting form", err);
      setError("Failed to submit the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label="Merchants" />

      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add Merchant Details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Details */}
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            {/* Category & SubCategory */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleSelectChange}
                  name="category"
                  label="Category"
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>SubCategory</InputLabel>
                <Select
                  value={formData.subCategory}
                  onChange={handleSelectChange}
                  name="subCategory"
                  label="SubCategory"
                  disabled={!formData.category}
                >
                  {subCategoriesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : (
                    subCategories.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Business Info */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Type of Entity"
                name="typeOfEntity"
                value={formData.typeOfEntity}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Authorized Signatory */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Authorized Signatory
          </Typography>
          <Grid container spacing={3}>
            {["name", "mobile", "email"].map((f) => (
              <Grid item xs={12} md={4} key={f}>
                <TextField
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={formData.authorizedSignatory[f as keyof typeof formData.authorizedSignatory]}
                  onChange={(e) =>
                    handleNestedChange("authorizedSignatory", f, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          {/* Accounts Contact */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Accounts Contact
          </Typography>
          <Grid container spacing={3}>
            {["name", "mobile", "email"].map((f) => (
              <Grid item xs={12} md={4} key={f}>
                <TextField
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={formData.accountsContact[f as keyof typeof formData.accountsContact]}
                  onChange={(e) =>
                    handleNestedChange("accountsContact", f, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          {/* Delivery Contact */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Delivery Contact
          </Typography>
          <Grid container spacing={3}>
            {["name", "mobile", "email"].map((f) => (
              <Grid item xs={12} md={4} key={f}>
                <TextField
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={formData.deliveryContact[f as keyof typeof formData.deliveryContact]}
                  onChange={(e) =>
                    handleNestedChange("deliveryContact", f, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          {/* Bank Account Details */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bank Account Details
          </Typography>
          <Grid container spacing={3}>
            {Object.keys(formData.bankAccountDetails).map((f) => (
              <Grid item xs={12} md={6} key={f}>
                <TextField
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={
                    formData.bankAccountDetails[
                      f as keyof typeof formData.bankAccountDetails
                    ]
                  }
                  onChange={(e) =>
                    handleNestedChange("bankAccountDetails", f, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          {/* Charges Section */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Charges & Taxes
          </Typography>
          <Grid container spacing={3}>
            {[
              "gstPercentage",
              "otherTaxes",
              "packagingCharges",
              "insuranceCharges",
              "deliveryCharges",
              "installationCharges",
            ].map((f) => (
              <Grid item xs={12} md={4} key={f}>
                <TextField
                  label={f.replace(/([A-Z])/g, " $1").trim()}
                  name={f}
                  value={formData[f as keyof typeof formData]}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" loading={loading}>
              Submit
            </ReusableButton>
            <CancelButton href="/admin/vendors/merchants">Cancel</CancelButton>
          </Box>
        </form>
      </Box>
    </>
  );
};

export default AddMerchant;
