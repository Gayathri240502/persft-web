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
            minWidth: 300,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
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
          height: { xs: "auto", sm: "70vh" },
          minHeight: 400,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#a8a8a8",
            },
          },
        }}
      >
        <Box
          sx={{
            minWidth: isMobile ? "1200px" : "100%",
            height: "100%",
          }}
        >
          <DataGrid
            {...props}
            columns={processedColumns}
            autoHeight={isMobile}
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
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#5a7299",
                color: "#000",
                fontWeight: 600,
                borderBottom: "2px solid #5a7299",
                "& .MuiDataGrid-columnHeaderTitle": {
                  color: "#000",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                },
              },
              "& .MuiDataGrid-cell": {
                paddingY: { xs: 0.5, sm: 1 },
                paddingX: { xs: 1, sm: 2 },
                borderBottom: "1px solid #e0e0e0",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                "&.Mui-selected": {
                  backgroundColor: "#f0e9e3 !important",
                  "&:hover": {
                    backgroundColor: "#e8ddd4 !important",
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#f8f9fa",
                borderTop: "1px solid #e0e0e0",
                color: "#333",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "& .MuiCheckbox-root": {
                color: "#b37f59",
                "&.Mui-checked": {
                  color: "#b37f59",
                },
              },
              "& .MuiDataGrid-toolbarContainer": {
                gap: 1,
                flexWrap: "wrap",
              },
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "auto",
              },
              "& .MuiDataGrid-virtualScrollerContent": {
                minWidth: isMobile ? "1200px" : "100%",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default StyledDataGrid;
