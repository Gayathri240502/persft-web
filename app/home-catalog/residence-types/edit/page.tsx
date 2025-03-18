"use client";

import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";


const ResidenceTypeForm = () => {
  return (
    <Dialog open={true} fullWidth maxWidth="sm">
      <DialogTitle>Edit Residence Type</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Name" 
              name="name" 
              required 
              variant="outlined"
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Description" 
              name="description" 
              required 
              multiline 
              rows={3} 
              variant="outlined"
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select name="category" label="Category">
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
                <MenuItem value="Cottage">Cottage</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Type</InputLabel>
              <Select name="type" label="Type">
                <MenuItem value="Luxury">Luxury</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Economy">Economy</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select name="status" label="Status">
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Price */}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Price" 
              name="price" 
              type="number" 
              required 
              variant="outlined"
            />
          </Grid>

          {/* Created Date (Fixed Label Issue) */}
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Created Date" 
              name="createdDate" 
              type="date" 
              variant="outlined" 
              InputLabelProps={{ shrink: true }} 
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
      <Button href="/home-catalog/residence-types">Cancel</Button> 
        <Button color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResidenceTypeForm;
