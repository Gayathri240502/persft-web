"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReusableButton from "@/app/components/Button";
import { useRouter } from "next/navigation";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

// Column Definitions for Orders
const columns: GridColDef[] = [
  { field: "sno", headerName: "S.No", width: 80 },
  { field: "id", headerName: "ID", width: 160 },
  { field: "customer", headerName: "Name", width: 160 },
  { field: "view", headerName: "View", width: 160 },
  { field: "uniqid", headerName: "Uniq ID", width: 160 },
  { field: "Created", headerName: "Created At", width: 160 },
  { field: "status", headerName: "Status", width: 160 },
  { field: "option", headerName: "Options", width: 160 },
];

// Sample Order Data (Empty Rows for UI)
const rows = Array.from({ length: 5 }, (_, index) => ({
  sno: index + 1,
  id: "-",
  order: "-",
  customer: "-",
  view: "-",
  uniqid: "-",
  created: "-",
  status: "-",
  option: "-",
}));

const Projects = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Projects
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
          <IconButton sx={{ color: "#05344c" }}>
            <FilterListIcon />
          </IconButton>
          {/* Export Orders Button */}
          <ReusableButton
            onClick={() => {
              router.push("/admin/projects/create");
            }}
          >
            Create Project
          </ReusableButton>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#05344c",
              "&:hover": { backgroundColor: "#042a3b" },
            }}
          >
            Export Orders
          </Button>
          {/* Print Button */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#05344c",
              "&:hover": { backgroundColor: "#042a3b" },
            }}
          >
            Import Project
          </Button>
          {/* PDF Button */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#05344c",
              "&:hover": { backgroundColor: "#042a3b" },
            }}
          >
            Export Project
          </Button>
        </Box>
      </Box>

      {/* Data Grid for Orders */}
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

export default Projects;
