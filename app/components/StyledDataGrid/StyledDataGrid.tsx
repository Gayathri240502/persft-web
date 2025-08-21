"use client";

import React, { useState, useCallback } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  type GridToolbarProps,
  type DataGridProps,
} from "@mui/x-data-grid";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import ReusableButton from "../Button";

interface CustomToolbarProps extends Partial<GridToolbarProps> {
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
}

const CustomToolbar = ({
  onAdd,
  onSearch,
  searchPlaceholder = "Search...",
  showAddButton = true,
  addButtonText = "Add",
}: CustomToolbarProps) => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    onSearch?.("");
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  return (
    <GridToolbarContainer
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Search */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <Tooltip title="Clear search">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Buttons */}
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        {showAddButton && onAdd && (
          <ReusableButton
            variant="contained"
            onClick={onAdd}
            startIcon={<AddIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            {addButtonText}
          </ReusableButton>
        )}
      </Box>
    </GridToolbarContainer>
  );
};

interface StyledDataGridProps
  extends Omit<DataGridProps, "slots" | "slotProps" | "columns"> {
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  disableAllSorting?: boolean;
  columns: DataGridProps["columns"];
}

const StyledDataGrid: React.FC<StyledDataGridProps> = ({
  onAdd,
  onSearch,
  searchPlaceholder,
  showAddButton,
  addButtonText,
  disableAllSorting = false,
  columns,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const processedColumns = disableAllSorting
    ? columns.map((col) => ({ ...col, sortable: false }))
    : columns;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Box
        sx={{
          width: "100%",
          height: { xs: "70vh", sm: "75vh", md: "80vh" }, // responsive height
          minHeight: 400,
          overflowX: "auto", // horizontal scroll if needed
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "4px",
          },
        }}
      >
        <DataGrid
          {...props}
          columns={processedColumns}
          disableRowSelectionOnClick
          checkboxSelection={false}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: isMobile ? 10 : 25,
                page: 0,
              },
            },
          }}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: {
              onAdd,
              onSearch,
              searchPlaceholder,
              showAddButton,
              addButtonText,
            } as any,
          }}
          density={isMobile ? "compact" : "standard"}
          sx={{
            fontFamily: theme.typography.fontFamily,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },

            // header
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#05344c",
              color: "white",
              fontWeight: 600,
              borderBottom: "2px solid #5a7299",
              "& .MuiDataGrid-columnHeaderTitle": {
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.8rem", sm: "0.95rem" },
              },
            },
            // cells
            "& .MuiDataGrid-cell": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              borderBottom: "1px solid #e0e0e0",
              "&:focus, &:focus-within": { outline: "none" },
            },

            // rows
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f5f5f5",
            },

            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#f8f9fa",
              borderTop: "1px solid #e0e0e0",
            },

            "& .MuiDataGrid-virtualScroller": {
              overflowX: "auto", // horizontal scroll
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default StyledDataGrid;
