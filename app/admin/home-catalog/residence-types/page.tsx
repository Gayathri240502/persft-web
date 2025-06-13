"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";

import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface ResidenceType {
  id: string;
  sn: number;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
}

// Custom hook for debouncing search input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

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

const ResidenceTypePage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const { token } = getTokenAndRole();

  // Debounce search with 300ms delay (industry standard)
  const debouncedSearch = useDebounce(search, 300);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchResidenceTypes = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        ...(debouncedSearch.trim() && { searchTerm: debouncedSearch.trim() }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/residence-types?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      const typesWithId = (result.residenceTypes || []).map(
        (item: any, index: number) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        })
      );

      setResidenceTypes(typesWithId);
      setRowCount(result.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, token]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchResidenceTypes();
  }, [fetchResidenceTypes]);

  // Reset to first page when search changes
  useEffect(() => {
    if (search !== debouncedSearch) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [debouncedSearch, search]);

  const handleDeleteClick = useCallback((id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedDeleteId || !token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete residence type");
      }

      await fetchResidenceTypes();
      handleDeleteCancel();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  }, [selectedDeleteId, token, fetchResidenceTypes, handleDeleteCancel]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // Handle pagination change
  const handlePaginationChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
    },
    []
  );

  // Handle navigation
  const handleView = useCallback(
    (id: string) => {
      router.push(`/admin/home-catalog/residence-types/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/home-catalog/residence-types/edit?id=${id}`);
    },
    [router]
  );

  const handleAdd = useCallback(() => {
    router.push("/admin/home-catalog/residence-types/add");
  }, [router]);

  // Memoize columns to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "sn",
        headerName: "SN",
        width: 70,
        sortable: false,
      },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        minWidth: 200,
      },
      {
        field: "thumbnail",
        headerName: "Thumbnail",
        flex: 1,
        minWidth: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const imageUrl = params.value;
          return imageUrl ? (
            <img
              src={imageUrl}
              alt="Thumbnail"
              style={{
                width: 30,
                height: 30,
                objectFit: "cover",
                borderRadius: 4,
              }}
              loading="lazy"
            />
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              fontStyle="italic"
            >
              No Image
            </Typography>
          );
        },
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1,
        minWidth: 150,
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row.id)}
              title="View"
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row.id)}
              title="Edit"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.id)}
              title="Delete"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [handleView, handleEdit, handleDeleteClick]
  );

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <StyledDataGrid
        rows={residenceTypes}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        autoHeight
        disableRowSelectionOnClick
        onAdd={handleAdd}
        onSearch={handleSearchChange}
        getRowId={(row) => row.id}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this residence type? This action
            cannot be undone and may affect related data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidenceTypePage;
