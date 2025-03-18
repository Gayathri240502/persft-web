"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Grid,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";

const AddNewAttribute: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: "",
    listOrder: "",
    name: "",
    description: "",
  });

  // Handle both text field and select changes correctly

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
  };

  const handleCancel = () => {
    router.push("/attribute-catalog/attributes"); // Navigate back
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
      <Box sx={{ width: "100%", maxWidth: "600px" }}>
        <Typography variant="h5" fontWeight="600" textAlign="center" mb={3}>
          Add New Attribute
        </Typography>

        <Card
          sx={{
            padding: 3,
            backgroundColor: "#05344c",
            color: "white",
            borderRadius: 2,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Type (Dropdown) */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Type:</Typography>
              </Grid>
              <Grid item xs={8}>
                <FormControl
                  fullWidth
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                >
                  <Select name="type" value={formData.type}>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* List Order */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>List Order:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="listOrder"
                  variant="outlined"
                  size="small"
                  value={formData.listOrder}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Name */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Name:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="name"
                  variant="outlined"
                  size="small"
                  value={formData.name}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Description:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="description"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  value={formData.description}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </Grid>

              {/* Buttons */}
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancel}
                  sx={{ width: "45%", borderRadius: "25px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    width: "45%",
                    borderRadius: "25px",
                    backgroundColor: "#00BFFF",
                    "&:hover": { backgroundColor: "#009ACD" },
                  }}
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

export default AddNewAttribute;
