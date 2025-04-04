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
import CancelButton from "@/app/components/CancelButton";

// Column Definitions for Orders
const columns: GridColDef[] = [
  { field: "id", headerName: "S.No", width: 80 },
  { field: "order", headerName: "Order ID", width: 160 },
  { field: "customer", headerName: "Customer Name", width: 160 },
  { field: "product", headerName: "Product", width: 160 },
  { field: "quantity", headerName: "Quantity", width: 160 },
  { field: "date", headerName: "Order Date", width: 160 },
  { field: "status", headerName: "Status", width: 160 },
  { field: "option", headerName: "Options", width: 160 },
];

// Sample Order Data (Empty Rows for UI)
const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  order:"-",
  customer: "-",
  product: "-",
  qantity: "-",
  date: "-",
  status: "-",
  option: "-",
}));

const CancelOrders = () => {
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
       Cancel Orders
      </Typography>

      {/* Search Bar & Buttons Above Table */}
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
          label="Search Orders"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Filter Button */}
          <CancelButton href="/admin/orders">
            Back
          </CancelButton>
          {/* Export Orders Button */}
          <Button
            variant="contained"
            sx={{ backgroundColor: "#05344c", "&:hover": { backgroundColor: "#042a3b" } }}
          >
            Export Orders
          </Button>
          {/* Print Button */}
          <Button
            variant="contained"
            sx={{ backgroundColor: "#05344c", "&:hover": { backgroundColor: "#042a3b" } }}
          >
            Print
          </Button>
          {/* PDF Button */}
          <Button
            variant="contained"
            sx={{ backgroundColor: "#05344c", "&:hover": { backgroundColor: "#042a3b" } }}
          >
            PDF
          </Button>
        </Box>
      </Box>

      {/* Data Grid for Orders */}
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

export default CancelOrders;
