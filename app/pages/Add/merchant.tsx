"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Card, Typography, Box, Grid, MenuItem, Select, FormControl } from "@mui/material";

const AddNewMerchant: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    merchantName: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Merchant Data Submitted:", formData);
  };

  const handleCancel = () => {
    router.push("/vendors/merchants");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: 3 }}>
      <Box sx={{ width: "100%", maxWidth: "600px" }}>
        {/* Heading */}
        <Typography variant="h5" fontWeight="600" textAlign="center" mb={3}>
          Add New Merchant
        </Typography>

        {/* Form Card */}
        <Card sx={{ padding: 3, backgroundColor: "#05344c", color: "white", borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Merchant Name */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Merchant Name:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="merchantName"
                  variant="outlined"
                  size="small"
                  value={formData.merchantName}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Email:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  variant="outlined"
                  size="small"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Phone:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  type="tel"
                  name="phone"
                  variant="outlined"
                  size="small"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Business Name */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Business Name:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="businessName"
                  variant="outlined"
                  size="small"
                  value={formData.businessName}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Address:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="address"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Category (Dropdown) */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Category:</Typography>
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth sx={{ backgroundColor: "white", borderRadius: 1 }}>
                  <Select name="category" value={formData.category}>
                    <MenuItem value="retail">Retail</MenuItem>
                    <MenuItem value="wholesale">Wholesale</MenuItem>
                    <MenuItem value="services">Services</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button variant="contained" color="error" onClick={handleCancel} sx={{ width: "45%", borderRadius: "25px" }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ width: "45%", borderRadius: "25px", backgroundColor: "#00BFFF", "&:hover": { backgroundColor: "#009ACD" } }}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </Box>
  );
};

export default AddNewMerchant;
