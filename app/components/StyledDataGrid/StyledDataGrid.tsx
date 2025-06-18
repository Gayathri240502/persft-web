"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  DataGridProps,
} from "@mui/x-data-grid";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ReusableButton from "../Button";

interface CustomToolbarProps {
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  searchValue?: string; // Current search value from parent
}

const CustomToolbar = React.memo(
  ({
    onAdd,
    onSearch,
    searchPlaceholder = "Search...",
    showAddButton = true,
    addButtonText = "Add",
    searchValue = "",
  }: CustomToolbarProps) => {
    const theme = useTheme();
    const [localSearchValue, setLocalSearchValue] = useState(searchValue);

    // Sync local state with parent state
    useEffect(() => {
      setLocalSearchValue(searchValue);
    }, [searchValue]);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchValue(value);
        onSearch?.(value);
      },
      [onSearch]
    );

    const handleClearSearch = useCallback(() => {
      setLocalSearchValue("");
      onSearch?.("");
    }, [onSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    }, []);

    const memoizedTextField = useMemo(
      () => (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={localSearchValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          sx={{
            minWidth: 300,
            maxWidth: 450,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: localSearchValue && (
              <InputAdornment position="end">
                <Tooltip title="Clear search">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                    sx={{ mr: -0.5 }}
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      ),
      [
        searchPlaceholder,
        localSearchValue,
        handleSearchChange,
        handleKeyDown,
        handleClearSearch,
        theme.palette.primary.main,
      ]
    );

    return (
      <GridToolbarContainer
        sx={{
          p: 2,
          margin: "5px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 60,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {memoizedTextField}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
            minHeight: 36, // Ensure consistent height
          }}
        >
          <GridToolbarColumnsButton size="small" />
          <GridToolbarFilterButton size="small" />
          <GridToolbarDensitySelector size="small" />
          <GridToolbarExport size="small" />
          {showAddButton && onAdd && (
            <ReusableButton
              variant="contained"
              onClick={onAdd}
              startIcon={<AddIcon />}
              size="small"
              sx={{
                whiteSpace: "nowrap",
                minWidth: "auto",
                height: 32, // Match other toolbar buttons
              }}
            >
              {addButtonText}
            </ReusableButton>
          )}
        </Box>
      </GridToolbarContainer>
    );
  }
);

CustomToolbar.displayName = "CustomToolbar";

interface StyledDataGridProps
  extends Omit<
    DataGridProps,
    "components" | "componentsProps" | "slots" | "slotProps"
  > {
  minWidth?: number | string;
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  searchValue?: string;
}

const StyledDataGrid = React.memo(
  ({
    minWidth = 1000,
    onAdd,
    onSearch,
    searchPlaceholder,
    showAddButton = true,
    addButtonText,
    searchValue = "",
    sx,
    ...props
  }: StyledDataGridProps) => {
    const theme = useTheme();

    // Memoize slot props to prevent unnecessary re-renders
    const toolbarProps = useMemo(
      () => ({
        onAdd,
        onSearch,
        searchPlaceholder,
        showAddButton,
        addButtonText,
        searchValue,
      }),
      [
        onAdd,
        onSearch,
        searchPlaceholder,
        showAddButton,
        addButtonText,
        searchValue,
      ]
    );

    // Memoize the styles object
    const dataGridStyles = useMemo(
      () => ({
        "& .MuiDataGrid-root": {
          border: `2px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
        },
        "& .MuiDataGrid-columnHeader": {
          fontSize: "0.95rem",
          fontWeight: 600,
          backgroundColor: theme.palette.grey[50],
          color: theme.palette.text.primary,
          borderBottom: `2px solid ${theme.palette.divider}`,
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 600,
        },
        "& .MuiDataGrid-row": {
          "&:nth-of-type(even)": {
            backgroundColor: theme.palette.background.default,
          },
          "&:nth-of-type(odd)": {
            backgroundColor: theme.palette.background.paper,
          },
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            "&:hover": {
              backgroundColor: theme.palette.action.selected,
            },
          },
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: `2px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[50],
        },
        "& .MuiDataGrid-toolbarContainer": {
          padding: 0,
        },
        "& .MuiDataGrid-overlay": {
          backgroundColor: theme.palette.background.paper,
        },
        "& .MuiCircularProgress-root": {
          color: theme.palette.primary.main,
        },
        "& .MuiDataGrid-virtualScroller": {
          // Ensure proper scrolling behavior
          overflowX: "auto",
        },
        "& .MuiDataGrid-columnHeaders": {
          borderBottom: `2px solid ${theme.palette.divider}`,
        },
        // Loading overlay styles
        "& .MuiDataGrid-loadingOverlay": {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(2px)",
        },
        // No rows overlay styles
        "& .MuiDataGrid-noRowsOverlay": {
          backgroundColor: theme.palette.background.paper,
        },
        ...sx,
      }),
      [theme, sx]
    );

    return (
      <Box
        sx={{
          width: "100%",
          minWidth,
          height: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DataGrid
          {...props}
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: toolbarProps,
            loadingOverlay: {
              variant: "circular-progress",
              noRowsVariant: "skeleton",
            },
          }}
          sx={dataGridStyles}
          disableColumnMenu={false}
          disableRowSelectionOnClick
          autoHeight
          checkboxSelection={false}
          disableColumnResize={false}
          density="standard"
          // Performance optimizations
          rowBuffer={10}
          columnBuffer={2}
          // Accessibility improvements
          aria-label="Products data grid"
        />
      </Box>
    );
  }
);

StyledDataGrid.displayName = "StyledDataGrid";

export default StyledDataGrid;
