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
      <DialogTitle>Edit Room Type</DialogTitle>
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

          {/* Group */}
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Group</InputLabel>
              <Select name="group" label="Group">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Guest">Guest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Created By */}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Created By" 
              name="createdBy" 
              required 
              variant="outlined" 
            />
          </Grid>

          {/* Date (Fixed Label Issue) */}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Date" 
              name="date" 
              type="date" 
              variant="outlined" 
              InputLabelProps={{ shrink: true }} 
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button href="/home-catalog/themes">Cancel</Button>
        <Button color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditForm;
