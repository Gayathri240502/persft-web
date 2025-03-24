"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  Button
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import ReusableButton from "@/app/components/Button";
import { useRouter } from "next/navigation";

// Column Definitions
const columns: GridColDef[] = [
  { field: "id", headerName: "SN", width: 80 },
  { field: "name", headerName: "Name", width: 185 },
  { field: "date", headerName: "Date", width: 185 },
  { field: "project", headerName: "Project", width: 185 },
  { field: "location", headerName: "Location", width: 185 },
  { field: "projectassign", headerName: "Project Assign", width: 185 },
  { field: "kiosk", headerName: "Kiosk User", width: 185 },
];

// Sample Data (Empty Rows for UI)
const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: "-",
  date:"-",
  project: "-",
  location: "-",
  projectassign:"-",
  kiosk:"-",
}));

const KioskManagement= () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Kiosk Management
      </Typography>

      {/* Search Bar & Add Button Above Table */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: isSmallScreen ? 2 : 1,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ReusableButton onClick={() => {
          router.push("kiosk-management/add")
        }}>
          ADD
        </ReusableButton>
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen} // Hide menu on small screens
          sx={{ "& .MuiDataGrid-columnHeaders": { fontSize: isSmallScreen ? "0.8rem" : "1rem" } }}
        />
      </Box>
    </Box>
  );
};

export default KioskManagement;
