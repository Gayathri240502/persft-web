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
} from "@mui/material";

const AddRoom: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = React.useState<{
    name: string;
    description: string;
    idOrUrl: string;
    residenceMapping: string[];
  }>({
    name: "",
    description: "",
    idOrUrl: "",
    residenceMapping: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      residenceMapping: checked
        ? [...prev.residenceMapping, value] // Add if checked
        : prev.residenceMapping.filter((item) => item !== value), // Remove if unchecked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  const handleCancel = () => {
    router.push("/home-catalog/room-types"); // Navigate back
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
          Add New Room
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Residence Mapping */}
              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>
                  Residence Mapping:
                </Typography>
                <Card sx={{ padding: 2, backgroundColor: "white", borderRadius: 2 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="1BHK"
                          checked={formData.residenceMapping.includes("1BHK")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="1BHK"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="2BHK"
                          checked={formData.residenceMapping.includes("2BHK")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="2BHK"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="3BHK"
                          checked={formData.residenceMapping.includes("3BHK")}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="3BHK"
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

export default AddRoom;
