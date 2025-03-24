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
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import {
  GridCsvExport,
  GridExcelExport,
  GridPdfExport,
  GridPrintExport,
} from "@mui/x-data-grid";

// Column Definitions
const columns: GridColDef[] = [
  { field: "id", headerName: "SN", width: 120 },
  { field: "uniqueId", headerName: "ID", width: 120 },
  { field: "name", headerName: "Name", width: 120 },
  { field: "description", headerName: "Description", width: 120 },
  { field: "type", headerName: "Type", width: 120 },
  { field: "addedBy", headerName: "Added By", width: 120 },
  { field: "action", headerName: "Action", width: 120 },
];

const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  uniqueId: `UID-${index + 1}`,
  name: "-",
  description: "-",
  type: "-",
  addedBy: "-",
  action: "-",
}));

const Products = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Products
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
          label="Search"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ReusableButton
          onClick={() => {
            router.push("/admin/product-catalog/products/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 1,
          mb: 2,
          alignItems: "center",
        }}
      >
        <Button variant="outlined" size="small">
          Show Rows
        </Button>
        <Button variant="outlined" size="small">
          Copy
        </Button>
        <Button variant="outlined" size="small">
          CSV
        </Button>
        <Button variant="outlined" size="small">
          Excel
        </Button>
        <Button variant="outlined" size="small">
          PDF
        </Button>
        <Button variant="outlined" size="small">
          Print
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
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: isSmallScreen ? "0.8rem" : "1rem",
            },
          }}
          components={{
            Toolbar: GridToolbar, // Optionally add default toolbar with export buttons
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true, // Enable search filter in toolbar if needed
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Products;
