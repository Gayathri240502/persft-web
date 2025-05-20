"use client";
import React from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  DataGridProps,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const CustomToolbar = () => {
  const theme = useTheme();

  return (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
};
interface StyledDataGridProps extends DataGridProps {
  minWidth?: number | string;
}

const StyledDataGrid = ({ minWidth = 1000, ...props }: StyledDataGridProps) => {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ minWidth }}>
        <DataGrid
          {...props}
          hideFooterSelectedRowCount
          slots={{ toolbar: CustomToolbar }}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "1.1rem",
              fontWeight: "bold",
              backgroundColor: "#0000FF",
              color: "black",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#f9f9f9",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#ffffff",
            },
            ...props.sx, // Allow external sx to be passed in
          }}
        />
      </Box>
    </Box>
  );
};

export default StyledDataGrid;
