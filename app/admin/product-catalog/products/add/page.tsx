"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const AddProducts = () => {
  // State for form fields
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [comhomId, setComhomId] = useState("");
  const [sku, setSku] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [wordTask, setWordTask] = useState("");
  const [attribute1, setAttribute1] = useState("");
  const [attribute2, setAttribute2] = useState("");

  // Handle form submission
  const handleSubmit = () => {
    const formData = {
      name,
      thumbnail,
      category,
      price,
      workshop,
      comhomId,
      sku,
      subCategory,
      brand,
      wordTask,
      attribute1,
      attribute2,
    };
    console.log("Form Submitted", formData);
  };

  // Handle cancel (clear form or go back)
  const handleCancel = () => {
    setName("");
    setThumbnail("");
    setCategory("");
    setPrice("");
    setWorkshop("");
    setComhomId("");
    setSku("");
    setSubCategory("");
    setBrand("");
    setWordTask("");
    setAttribute1("");
    setAttribute2("");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Add New Products
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Thumbnail"
            fullWidth
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Category"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Price"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Workshop"
            fullWidth
            value={workshop}
            onChange={(e) => setWorkshop(e.target.value)}
            sx={{ mb: 3 }}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Comhom ID"
            fullWidth
            value={comhomId}
            onChange={(e) => setComhomId(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="SKU"
            fullWidth
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Sub Category"
            fullWidth
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Brand"
            fullWidth
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Word Task"
            fullWidth
            value={wordTask}
            onChange={(e) => setWordTask(e.target.value)}
            sx={{ mb: 3 }}
          />
        </Grid>
      </Grid>

      {/* Divider between fields and attributes */}
      <Divider sx={{ my: 3 }} />

      {/* Separate Section for Attributes */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Attributes
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Attribute 1"
              fullWidth
              value={attribute1}
              onChange={(e) => setAttribute1(e.target.value)}
              sx={{ mb: 3 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Attribute 2"
              fullWidth
              value={attribute2}
              onChange={(e) => setAttribute2(e.target.value)}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton onClick={handleSubmit}>Submit</ReusableButton>
        <CancelButton onClick={handleCancel}>Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddProducts;
