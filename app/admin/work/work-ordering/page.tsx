"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const WorkOrdering = () => {
  const [activeSection, setActiveSection] = useState("");

  // Drag & drop UI (no file handling logic, purely visual)
  const renderUploadBox = () => (
    <Paper
      elevation={3}
      sx={{
        border: "2px dashed #90caf9",
        p: 4,
        textAlign: "center",
        mt: 3,
        backgroundColor: "#f5f5f5",
        cursor: "pointer",
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
      <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 500 }}>
        Drag and drop files here or click to upload
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 4 }}>
      {/* Heading */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Work Ordering
      </Typography>

      {/* Buttons for work types */}
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant={activeSection === "civil" ? "contained" : "outlined"}
            onClick={() => setActiveSection("civil")}
          >
            Civil Work
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={activeSection === "electrical" ? "contained" : "outlined"}
            onClick={() => setActiveSection("electrical")}
          >
            Electrical Work
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={activeSection === "plumbing" ? "contained" : "outlined"}
            onClick={() => setActiveSection("plumbing")}
          >
            Plumbing Work
          </Button>
        </Grid>
      </Grid>

      {/* File upload area conditionally rendered */}
      {activeSection && (
        <Box>
          <Typography variant="h6" sx={{ mt: 4 }}>
            Upload Files for {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Work
          </Typography>
          {renderUploadBox()}
        </Box>
      )}
    </Box>
  );
};

export default WorkOrdering;
