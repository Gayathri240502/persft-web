// app/components/StyledDataGrid.tsx

"use client";
import React from "react";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const StyledDataGrid: React.FC<DataGridProps> = (props) => {
  return (
    <Box
      sx={{
        overflowX: "scroll",
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#ccc",
          borderRadius: "4px",
        },
      }}
    >
      <DataGrid
        hideFooterSelectedRowCount
        sx={{
          minWidth: "600px", // Ensures horizontal scroll if on small screen
          "& .MuiDataGrid-columnHeaders": {
            fontSize: "1.1rem",
            fontWeight: "bold",
            backgroundColor: "#f0f0f0",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f9f9f9",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
          ...props.sx,
        }}
        {...props}
      />
    </Box>
  );
};

export default StyledDataGrid;
