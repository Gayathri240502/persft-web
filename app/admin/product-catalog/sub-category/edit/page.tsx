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

const EditForm = () => {
  return (
    <Dialog open={true} fullWidth maxWidth="sm">
      <DialogTitle>Edit Sub Category</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* ID */}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="ID" 
              name="id" 
              variant="outlined" 
              disabled 
            />
          </Grid>

          {/* Name */}
          <Grid item xs={12} sm={6}>
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
              multiline 
              rows={3} 
              variant="outlined" 
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Type</InputLabel>
              <Select name="type" label="Type">
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Added By */}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Added By" 
              name="addedBy" 
              required 
              variant="outlined" 
            />
          </Grid>

          {/* Option */}
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Option</InputLabel>
              <Select name="option" label="Option">
                <MenuItem value="Enabled">Enabled</MenuItem>
                <MenuItem value="Disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button href="/product-catalog/sub-category">Cancel</Button>
        <Button color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditForm;
