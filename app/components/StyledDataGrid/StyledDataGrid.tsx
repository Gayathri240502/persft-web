"use client";
import React from "react";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const StyledDataGrid: React.FC<DataGridProps> = (props) => {
  return (
    <Box
      sx={{
        width: "100%", // Full width container
        height: "100%", // Fixed height
        position: "relative", // Fixed positioning
        overflowX: "auto", // Allows horizontal scrolling
        overflowY: "hidden", // Prevents unnecessary page scrolling
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
          minWidth: "1000px", // Adjusted for content width
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
          "& .MuiDataGrid-root": {
            overflow: "auto", // Ensures internal scrolling within grid
          },
          ...props.sx,
        }}
        {...props}
      />
    </Box>
  );
};

export default StyledDataGrid;
