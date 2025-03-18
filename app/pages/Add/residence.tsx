"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Card, Typography, Box, Grid } from "@mui/material";

const AddResidence: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    idOrUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  const handleCancel = () => {
    router.push("/home-catalog/residence-types");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "700px" }}>
        {/* Heading */}
        <Typography
          variant="h4"
          fontWeight="600"
          textAlign="center"
          mb={3}
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          Add New Residence Type
        </Typography>

        {/* Form Card */}
        <Card
          sx={{
            padding: { xs: 3, sm: 4 },
            backgroundColor: "#05344c",
            color: "white",
            borderRadius: 3,
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            minHeight: "500px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Name Field */}
              <Grid item xs={12} md={5} display="flex" alignItems="center">
                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Name:</Typography>
              </Grid>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  name="name"
                  variant="outlined"
                  size="medium"
                  value={formData.name}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Description Field */}
              <Grid item xs={12} md={5} display="flex" alignItems="center">
                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Description:</Typography>
              </Grid>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  name="description"
                  variant="outlined"
                  size="medium"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* ID or URL Field */}
              <Grid item xs={12} md={5} display="flex" alignItems="center">
                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>ID or URL:</Typography>
              </Grid>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  name="idOrUrl"
                  variant="outlined"
                  size="medium"
                  value={formData.idOrUrl}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Buttons Section */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancel}
                  sx={{
                    width: "45%",
                    padding: "8px 0",
                    fontSize: "0.9rem",
                    borderRadius: "25px", // Circular button
                    backgroundColor: "#d32f2f",
                    "&:hover": { backgroundColor: "#b71c1c" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    width: "45%",
                    padding: "8px 0",
                    fontSize: "0.9rem",
                    borderRadius: "25px", // Circular button
                    backgroundColor: "#00aaff", // Sky blue color
                    "&:hover": { backgroundColor: "#008ecc" },
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

export default AddResidence;
