import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";

const DashboardBoxes = () => {
  return (
    <Box sx={{ p: 4, backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 4 }}>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        {/* Home Catalog Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <HomeIcon sx={{ color: "#00bcd4", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Home Catalog</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Manage home categories</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Product Catalog Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <InventoryIcon sx={{ color: "#9c27b0", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Product Catalog</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Browse all products</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Vendors Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <StoreIcon sx={{ color: "#fbc02d", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Vendors</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Manage vendor profiles</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Users Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <PeopleIcon sx={{ color: "#388e3c", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Users</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>View and manage users</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Projects Box */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow 0.3s" }}>
            <BusinessIcon sx={{ color: "#e53935", fontSize: "2rem" }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600" }}>Projects</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Manage ongoing projects</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardBoxes;
