"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

const CreateProject = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        Rajpushpa:
      </Typography>
      
      {/* Residence Mapping */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Residence Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="1 BHK" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="2 BHK" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="3 BHK" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="4 BHK" /></Grid>
        </Grid>
      </Box>

      {/* Room Mapping */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Room Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Bedroom" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Living Room" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Kitchen" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Bathroom" /></Grid>
        </Grid>
      </Box>

      {/* Theme Mapping */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Theme Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Modern" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Minimalist" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Traditional" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Industrial" /></Grid>
        </Grid>
      </Box>

      {/* Design Mapping */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Design Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Luxury" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Contemporary" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Vintage" /></Grid>
          <Grid item xs={6}><FormControlLabel control={<Checkbox />} label="Rustic" /></Grid>
        </Grid>
      </Box>

      {/* Submit and Cancel Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton>
          Submit
        </ReusableButton>
        <CancelButton href="/admin/projects">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default CreateProject;
