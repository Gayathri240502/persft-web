"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const AddSubcategory: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = React.useState<{
    category: string;
    name: string;
    description: string;
    idOrUrl: string;
    attributeGroupMapping: string[];
  }>({
    category: "",
    name: "",
    description: "",
    idOrUrl: "",
    attributeGroupMapping: [],
  });

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    if (!e.target.name) return;
    setFormData({ ...formData, [e.target.name]: e.target.value as string });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      attributeGroupMapping: checked
        ? [...prev.attributeGroupMapping, value] // Add if checked
        : prev.attributeGroupMapping.filter((item) => item !== value), // Remove if unchecked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  const handleCancel = () => {
    router.push("/product-catalog/sub-category"); // Navigate back
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: { xs: "90%", sm: "80%", md: "650px" } }}>
        {/* Heading */}
        <Typography
          variant="h5"
          fontWeight="600"
          textAlign="center"
          mb={3}
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          Add New Subcategory
        </Typography>

        {/* Form Card */}
        <Card
          sx={{
            padding: { xs: 3, sm: 4 },
            backgroundColor: "#05344c",
            color: "white",
            borderRadius: 2,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Category Selection */}
              <Grid item xs={12} md={4}>
                <Typography variant="body1">Category:</Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "white" }}>Select Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                  >
                    <MenuItem value="Category 1">Category 1</MenuItem>
                    <MenuItem value="Category 2">Category 2</MenuItem>
                    <MenuItem value="Category 3">Category 3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Name */}
              <Grid item xs={12} md={4}>
                <Typography variant="body1">Name:</Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  name="name"
                  variant="outlined"
                  size="small"
                  value={formData.name}
                  onChange={(e) => handleChange(e as any)}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={4}>
                <Typography variant="body1">Description:</Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  name="description"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange(e as any)}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* ID or URL */}
              <Grid item xs={12} md={4}>
                <Typography variant="body1">ID or URL:</Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  name="idOrUrl"
                  variant="outlined"
                  size="small"
                  value={formData.idOrUrl}
                  onChange={(e) => handleChange(e as any)}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Attribute Group Mapping */}
              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>
                  Attribute Group Mapping:
                </Typography>
                <Card sx={{ padding: 2, backgroundColor: "white", borderRadius: 2 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="Group 1"
                          checked={formData.attributeGroupMapping.includes("Group 1")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Group 1"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="Group 2"
                          checked={formData.attributeGroupMapping.includes("Group 2")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Group 2"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="Group 3"
                          checked={formData.attributeGroupMapping.includes("Group 3")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Group 3"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="Group 4"
                          checked={formData.attributeGroupMapping.includes("Group 4")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Group 4"
                    />
                  </FormGroup>
                </Card>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancel}
                  sx={{
                    width: "45%",
                    borderRadius: "25px",
                    fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    width: "45%",
                    borderRadius: "25px",
                    fontSize: "0.875rem",
                    backgroundColor: "#00BFFF", // Sky blue color
                    "&:hover": { backgroundColor: "#009ACD" }, // Darker shade on hover
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </Box>
  );
};

export default AddSubcategory;
