"use client";

import React, { useState, useCallback } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
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
        margin: "5px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          sx={{
            minWidth: 350,
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
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
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <Tooltip title="Clear search">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                    sx={{ mr: -0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
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
            onClick={onAdd}
            startIcon={<AddIcon />}
            sx={{
              whiteSpace: "nowrap",
              minWidth: "auto",
            }}
          >
            {addButtonText}
          </ReusableButton>
        )}
      </Box>
    </GridToolbarContainer>
  );
};

interface StyledDataGridProps
  extends Omit<DataGridProps, "slots" | "slotProps"> {
  minWidth?: number | string;
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  searchValue?: string;
  addButtonText?: string;
}

const StyledDataGrid: React.FC<StyledDataGridProps> = ({
  minWidth = 1000,
  onAdd,
  onSearch,
  searchPlaceholder,
  showAddButton,
  addButtonText,
  ...props
}) => {
  const theme = useTheme();

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
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
          toolbar: {
            onAdd,
            onSearch,
            searchPlaceholder,
            showAddButton,
            addButtonText,
          } as any,
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
          "& .MuiDataGrid-toolbarContainer": {
            padding: 0,
          },
          "& .MuiDataGrid-overlay": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .MuiCircularProgress-root": {
            color: theme.palette.primary.main,
          },
        }}
      />
    </Box>
  );
};

export default StyledDataGrid;
