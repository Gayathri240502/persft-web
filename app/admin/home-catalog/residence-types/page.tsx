"use client";
import ReusableButton from "@/app/components/Button";
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
import { useRouter } from "next/navigation";

// Column Definitions
const columns: GridColDef[] = [
  { field: "id", headerName: "SN", width: 80 },
  { field: "name", headerName: "Name", width: 120 },
  { field: "description", headerName: " Description", width: 150 },
  { field: "category", headerName: "Category", width: 150 },
  { field: "type", headerName: "Type", width: 100 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "price", headerName: "Price", width: 140 },
  { field: "createdby", headerName: "Created By", width: 200 },
  { field: "action", headerName: "Action", width: 100 },
];

// Sample Data (Empty Rows for UI)
const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: "-",
  description: "-",
  category: "-",
  type: "-",
  status: "-",
  price: "-",
  createdby: "-",
  action: "-",
}));

const ResidenceType = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Residence Types
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
        <ReusableButton
          onClick={() => {
            router.push("/admin/home-catalog/residence-types/add");
          }}
        >
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
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: isSmallScreen ? "0.8rem" : "1rem",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ResidenceType;
