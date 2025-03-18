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
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const AddAttributeGroup: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    selectedAttributes: {
      wood: false,
      woodType: false,
    },
    productCategoryMapping: {
      sofa: {
        sofa: false,
        twoSeatSofa: false,
        fourSeatSofa: false,
      },
      chair: {
        chair: false,
        wood: false,
        plastic: false,
      },
    },
  });

  const handleCancel = () => {
    router.push("/attribute-catalog/attributes-groups");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "600px" }}>
        {/* Heading */}
        <Typography variant="h5" fontWeight="600" textAlign="center" mb={3}>
          Attribute Groups
        </Typography>

        {/* Form Card */}
        <Card
          sx={{
            padding: 3,
            backgroundColor: "#05344c",
            color: "white",
            borderRadius: 2,
          }}
        >
          <form>
            <Grid container spacing={2}>
              {/* Group Name */}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 500 }}>Group Name:</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  name="groupName"
                  variant="outlined"
                  size="small"
                  value={formData.groupName}
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

              {/* Selected Attributes */}
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 500, mb: 1 }}>
                  Selected Attributes:
                </Typography>
                <Card
                  sx={{ padding: 2, backgroundColor: "white", borderRadius: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox checked={formData.selectedAttributes.wood} />
                    }
                    label="Model"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.selectedAttributes.woodType}
                      />
                    }
                    label="Finish"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.selectedAttributes.woodType}
                      />
                    }
                    label="Wood Type"
                  />
                </Card>
              </Grid>

              {/* Product Category Mapping */}
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 500, mb: 1 }}>
                  Product Category Mapping:
                </Typography>
                <Card
                  sx={{ padding: 2, backgroundColor: "white", borderRadius: 1 }}
                >
                  {/* Sofa Category */}
                  <Typography sx={{ fontWeight: 500 }}>Sofa:</Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          formData.productCategoryMapping.sofa.twoSeatSofa
                        }
                      />
                    }
                    label="Two Seat Sofa"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          formData.productCategoryMapping.sofa.fourSeatSofa
                        }
                      />
                    }
                    label="Four Seat Sofa"
                  />

                  {/* Chair Category */}
                  <Typography sx={{ fontWeight: 500, mt: 2 }}>
                    Chair:
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.productCategoryMapping.chair.wood}
                      />
                    }
                    label="Wood"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.productCategoryMapping.chair.plastic}
                      />
                    }
                    label="Plastic"
                  />
                </Card>
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

export default AddAttributeGroup;
