"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReusableButton from "@/app/components/Button";
import Link from "next/link";

// Columns for Orders Table
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

// Remove dummy data for now
// const rows = Array.from({ length: 5 }, (_, index) => ({
//   id: index + 1,
//   order: "-",
//   customer: "-",
//   product: "-",
//   quantity: "-",
//   date: "-",
//   status: "-",
//   option: "-",
// }));

// Use an empty array or fetch from API
const rows: any[] = []; // Replace with API data when available

const Orders = () => {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Handlers for filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Orders
      </Typography>

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
          <IconButton sx={{ color: "#05344c" }} onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>

          {/* Dropdown Menu */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleFilterClose}>
            {/* <MenuItem onClick={handleFilterClose}>
              <Link href="/orders" style={{ textDecoration: "none", color: "inherit" }}>
                Orders
              </Link>
            </MenuItem> */}
            <MenuItem onClick={handleFilterClose}>
              <Link
                href="/admin/orders/list-orders"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                List Orders
              </Link>
            </MenuItem>
            <MenuItem onClick={handleFilterClose}>
              <Link
                href="/admin/orders/canceled-orders"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Canceled Orders
              </Link>
            </MenuItem>
          </Menu>

          {/* Other Buttons */}
          <ReusableButton>Export Orders</ReusableButton>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#05344c",
              "&:hover": { backgroundColor: "#042a3b" },
            }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#05344c",
              "&:hover": { backgroundColor: "#042a3b" },
            }}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
        <StyledDataGrid
          columns={columns}
          rows={rows}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
        />
      </Box>
    </Box>
  );
};

export default Orders;
