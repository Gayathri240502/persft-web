"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

// ======================
// Custom Toolbar
// ======================

interface CustomToolbarProps {
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  initialSearchValue?: string;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  onAdd,
  onSearch,
  searchPlaceholder = "Search...",
  showAddButton = true,
  addButtonText = "Add",
  initialSearchValue = "",
}) => {
  const theme = useTheme();
  const [localSearchValue, setLocalSearchValue] = useState(initialSearchValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalSearchValue(initialSearchValue);
  }, [initialSearchValue]);

  // Handle input change without debounce - let parent handle debouncing
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
    // Focus back to input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [onSearch]);

  // Prevent form submission on Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  return (
    <GridToolbarContainer
      sx={{
        p: 2,
        gap: 2,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          ref={inputRef}
          size="small"
          value={localSearchValue}
          placeholder={searchPlaceholder}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          sx={{
            minWidth: 300,
            maxWidth: 400,
            "& .MuiInputBase-input": {
              // Ensure input maintains focus
              "&:focus": {
                outline: "none",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: localSearchValue ? (
              <InputAdornment position="end">
                <Tooltip title="Clear search">
                  <IconButton
                    onClick={handleClearSearch}
                    size="small"
                    tabIndex={-1} // Prevent focus stealing
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        {showAddButton && onAdd && (
          <ReusableButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ whiteSpace: "nowrap" }}
          >
            {addButtonText}
          </ReusableButton>
        )}
      </Box>
    </GridToolbarContainer>
  );
};

// ======================
// Styled DataGrid
// ======================

interface StyledDataGridProps
  extends Omit<DataGridProps, "components" | "componentsProps"> {
  minWidth?: number | string;
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  searchValue?: string;
}

const StyledDataGrid: React.FC<StyledDataGridProps> = ({
  minWidth = 1000,
  onAdd,
  onSearch,
  searchPlaceholder,
  showAddButton = true,
  addButtonText,
  searchValue = "",
  sx,
  ...props
}) => {
  const theme = useTheme();

  // Memoize toolbar props to prevent unnecessary re-renders
  const toolbarProps = React.useMemo(
    () => ({
      onAdd,
      onSearch,
      searchPlaceholder,
      showAddButton,
      addButtonText,
      initialSearchValue: searchValue,
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

  return (
    <Box
      sx={{
        width: "100%",
        minWidth,
        height: "auto",
        "& .MuiDataGrid-root": {
          border: `2px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DataGrid
        {...props}
        autoHeight
        disableColumnMenu={false}
        disableRowSelectionOnClick
        checkboxSelection={false}
        density="standard"
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          toolbar: toolbarProps,
        }}
        sx={{
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
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.grey[50],
          },
          "& .MuiDataGrid-overlay": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .MuiCircularProgress-root": {
            color: theme.palette.primary.main,
          },
          ...sx,
        }}
      />
    </Box>
  );
};

export default StyledDataGrid;
