"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

// Column Definitions
const columns: GridColDef[] = [
  { field: "id", headerName: "SN", width: 80 },
  { field: "code", headerName: "ID", width: 185 },
  { field: "name", headerName: "Name", width: 185 },
  { field: "group", headerName: "Group", width: 185 },
  { field: "createdby", headerName: "Created By", width: 185 },
  { field: "date", headerName: "Date", width: 185 },
  { field: "action", headerName: "Action", width: 185 },
];

// Sample Data (Empty Rows for UI)
const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  code:"-",
  name: "-",
  group:"-",
  createdby: "-",
  date: "-",
  action:"-",
}));

const RoomType= () => {
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Design Types
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
        <Button  variant="contained"
  sx={{ backgroundColor: "#05344c", "&:hover": { backgroundColor: "#042a3b" } }}
  fullWidth={isSmallScreen} href="design/add">
          ADD
        </Button>
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

export default RoomType;
