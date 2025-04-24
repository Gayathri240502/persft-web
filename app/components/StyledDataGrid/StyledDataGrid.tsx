"use client";
import React from "react";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const StyledDataGrid: React.FC<DataGridProps> = (props) => {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ minWidth: "1000px", height: 500 }}>
        <DataGrid
          hideFooterSelectedRowCount
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "1.1rem",
              fontWeight: "bold",
              backgroundColor: "#0000FF.",
              color: "black",
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
    </Box>
  );
};

export default StyledDataGrid;
