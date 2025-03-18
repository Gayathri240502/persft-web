import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { Campaign, Group, HelpOutline, Email } from "@mui/icons-material";  // Material UI Icons

const DashboardBoxes = () => {
  return (
    <Box sx={{ p: 4, backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 4 }}>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        {/* Campaigns Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <Campaign sx={{ color: "#00bcd4", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Campaigns</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Manage your campaigns</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Customers Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <Group sx={{ color: "#9c27b0", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Customers</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>View customer details</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Queries Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <HelpOutline sx={{ color: "#fbc02d", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Queries</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Check customer queries</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Opens Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <Email sx={{ color: "#388e3c", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Opens</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Track email opens</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardBoxes;
