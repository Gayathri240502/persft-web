"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  Typography,
  Box,
  Grid,
} from "@mui/material";

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    numberBlocks: "",
    numberFloors: "",
    numberFlats: "",
    lowestPrice: "",
    maxPrice: "",
    currency: "USD",
    category: "Apartment",
    features: {
      wifi: false,
      parking: false,
      pool: false,
      balcony: false,
      garden: false,
      security: false,
      fitnessCenter: false,
      airConditioning: false,
      centralHeating: false,
      laundryRoom: false,
      petsAllow: false,
      spaMassage: false,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        features: {
          ...formData.features,
          [name]: checked,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
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
      <Box
        sx={{ width: "100%", maxWidth: { xs: "90%", sm: "80%", md: "750px" } }}
      >
        <Typography
          variant="h5"
          fontWeight="600"
          textAlign="center"
          mb={3}
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          Add New Project
        </Typography>

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
              <Grid item xs={12} md={6}>
                <TextField
                  name="name"
                  label="Project Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  required
                  value={formData.location}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="numberBlocks"
                  label="Number Blocks"
                  fullWidth
                  required
                  value={formData.numberBlocks}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="numberFloors"
                  label="Number Floors"
                  fullWidth
                  required
                  value={formData.numberFloors}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="numberFlats"
                  label="Number Flats"
                  fullWidth
                  required
                  value={formData.numberFlats}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="lowestPrice"
                  label="Lowest Price"
                  fullWidth
                  required
                  value={formData.lowestPrice}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="maxPrice"
                  label="Max Price"
                  fullWidth
                  required
                  value={formData.maxPrice}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <MenuItem value="Apartment">Apartment</MenuItem>
                    <MenuItem value="Villa">Villa</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="House">House</MenuItem>
                    <MenuItem value="Land">Land</MenuItem>
                    <MenuItem value="Commercial property">
                      Commercial Property
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>
                  Features:
                </Typography>
                <Grid container spacing={1}>
                  {Object.keys(formData.features).map((feature) => (
                    <Grid item xs={6} key={feature}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name={feature}
                            checked={formData.features[feature]}
                            onChange={handleChange}
                          />
                        }
                        label={feature.replace(/([A-Z])/g, " $1").trim()}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center", mt: 3 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    width: "45%",
                    borderRadius: "25px",
                    fontSize: "0.875rem",
                    backgroundColor: "#00BFFF",
                    "&:hover": { backgroundColor: "#009ACD" },
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
}
