"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Typography, Box, Grid } from "@mui/material";

const AddNewProduct: React.FC = () => {
  const router = useRouter();
  const [productFile, setProductFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProductFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploaded Product File:", productFile);
  };

  const handleCancel = () => {
    router.push("/product-catalog/products"); // Navigate back
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
      <Box sx={{ width: "100%", maxWidth: { xs: "90%", sm: "80%", md: "450px" } }}>
        {/* Heading */}
        <Typography variant="h5" fontWeight="600" textAlign="center" mb={3}>
          Add New Product
        </Typography>

        {/* Form Card */}
        <Card sx={{ padding: 3, backgroundColor: "#05344c", color: "white", borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Upload Product */}
              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>
                  Upload Product:
                </Typography>
                <input
                  type="file"
                  accept="image/*, .pdf, .doc, .docx"
                  onChange={handleFileChange}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "white",
                    borderRadius: "5px",
                  }}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
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
                    backgroundColor: "#00BFFF", // Sky blue
                    "&:hover": { backgroundColor: "#009ACD" }, // Darker blue on hover
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

export default AddNewProduct;
