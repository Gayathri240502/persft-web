"use client";
import ReusableButton from "@/app/components/Button";
import React, { useState } from "react";
import { Box, Typography, TextField, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

// Column Definitions
const columns: GridColDef[] = [
  { field: "id", headerName: "SN", width: 120 },
  { field: "name", headerName: "Name", width: 120 },
  { field: "description", headerName: "Description", width: 120 },
  { field: "listOrders", headerName: "List Orders", width: 120 },
  { field: "type", headerName: "Type", width: 120 },
  { field: "action", headerName: "Action", width: 120 },
];

const rows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: "-",
  description: "-",
  listOrders: "-",
  type: "-",
  action: "-",
}));

const AttributeGroups = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Attribute Groups
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
            router.push("/admin/attribute-catalog/attributes-groups/add");
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
        {/* Data Grid */}
        <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
          <DataGrid
            columns={columns}
            rows={rows}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                fontSize: isSmallScreen ? "0.8rem" : "1rem",
              },
            }}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AttributeGroups;
