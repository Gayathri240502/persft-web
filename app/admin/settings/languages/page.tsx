"use client";
import ReusableButton from "@/app/components/Button";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

// Column Definitions
const columns: GridColDef[] = [
  { field: "id", headerName: "SN", width: 80 },
  { field: "name", headerName: "Language Name", width: 280 },
  { field: "code", headerName: "Code", width: 280 },
  { field: "status", headerName: "Status", width: 270 },
  { field: "action", headerName: "Action", width: 280 },
];

// Sample Data (Empty Rows for UI)
const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: "-",
  code: "-",
  status: "-",
  action: "-",
}));

const LanguageSettings = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Language Settings
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
            router.push("/admin/settings/languages/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "right",
          mb: 2,
          gap: isSmallScreen ? 2 : 1,
        }}
      >
        <Button variant="outlined" color="primary">
          Copy
        </Button>
        <Button variant="outlined" color="primary">
          Excel
        </Button>
        <Button variant="outlined" color="primary">
          Pdf
        </Button>
        <Button variant="outlined" color="primary">
          Print
        </Button>
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
        <StyledDataGrid
          columns={columns}
          rows={rows}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen} // Hide menu on small screens
        />
      </Box>
    </Box>
  );
};

export default LanguageSettings;
