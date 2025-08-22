"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

// Types for RoomDesign and SelectionReference
interface RoomDesign {
  _id: string;
  name: string;
  description: string;
  coohomUrl: string;
  thumbnail: string;
  selections: SelectionReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

interface SelectionReference {
  _id: string;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const DesignType = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [designs, setDesigns] = useState<RoomDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useTokenAndRole();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  // Debounced search with 500ms delay (industry standard for search)
  const debouncedSearch = useDebounce(search, 300);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDesigns = useCallback(async () => {
    if (!token) return; // Guard clause for token

    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });

      // Only add search term if it's not empty after trimming
      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Add signal for request cancellation if needed
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch designs: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (Array.isArray(result.designs)) {
        const typesWithId = result.designs.map((item: any, index: number) => ({
          ...item,
          selections: Array.isArray(item.selections) ? item.selections : [],
          id: item._id,
          sn: page * pageSize + index + 1,
        }));

        setDesigns(typesWithId);
        setRowCount(result.total || 0);
      } else {
        setDesigns([]);
        setRowCount(0);
      }
    } catch (error: any) {
      console.error("Error fetching designs:", error);
      setError(
        error.name === "AbortError"
          ? "Request timeout. Please try again."
          : "An error occurred while fetching the design types."
      );
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, token]);

  // Effect for fetching data when dependencies change
  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Effect to reset pagination when search changes
  useEffect(() => {
    // Reset to first page when search term changes
    if (debouncedSearch !== search) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [debouncedSearch, search]);

  // Handlers
  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/admin/home-catalog/design/add");
  }, [router]);

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId || !token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete design: ${response.status} ${response.statusText}`
        );
      }

      // Refresh data after successful deletion
      await fetchDesigns();
      handleDeleteCancel();
    } catch (error: any) {
      console.error("Delete error:", error);
      setError(
        error.name === "AbortError"
          ? "Delete request timeout. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to delete item"
      );
    } finally {
      setLoading(false);
    }
  };

  // Memoized columns to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", width: 70 },
      { field: "name", headerName: "Name", flex: 1 },
      { field: "description", headerName: "Description", flex: 1 },
      {
        field: "thumbnail",
        headerName: "Thumbnail",
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          params.row.thumbnail ? (
            <img
              src={params.row.thumbnail}
              alt={`Thumbnail for ${params.row.name}`}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 4,
              }}
              loading="lazy" // Optimize image loading
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              N/A
            </Typography>
          ),
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                router.push(
                  `/admin/home-catalog/design/id?id=${params.row._id}`
                )
              }
              aria-label={`View ${params.row.name}`}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                router.push(
                  `/admin/home-catalog/design/edit?id=${params.row._id}`
                )
              }
              aria-label={`Edit ${params.row.name}`}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteClick(params.row.id)}
              aria-label={`Delete ${params.row.name}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [router]
  );

  return (
    <>
      <Navbar label="Design Types" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* Error Message */}
        {error && (
          <Box sx={{ mb: 2, color: "error.main", textAlign: "center" }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        {/* Data Grid */}
        <Box sx={{ width: "100%" }}>
          <StyledDataGrid
            columns={columns}
            rows={designs}
            rowCount={rowCount}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            disableAllSorting
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchPlaceholder="Search Designs..."
            addButtonText="Add"
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this design? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DesignType;
