"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Kiosk {
  _id: string;
  firstName: string;
  lastName: string;
  description: string;
  address: string;
  countryName: string;
  stateName: string;
  cityName: string;
  projects: string[];
  projectNames: string[];
  id?: string;
  sn?: number;
  keycloakId?: string;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const KioskManagement = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearch]);

  const fetchKiosks = useCallback(
    async (currentPaginationModel: GridPaginationModel, searchTerm: string) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const { page, pageSize } = currentPaginationModel;
        const queryParams = new URLSearchParams({
          page: String(page + 1), // Convert 0-based to 1-based for API
          limit: String(pageSize),
          ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
        });

        console.log("Fetching with params:", {
          page: page + 1,
          limit: pageSize,
          searchTerm: searchTerm.trim(),
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const result = await res.json();
        console.log("API Response:", result);

        // Map data with correct serial numbers
        const mappedData =
          result.kiosks?.map((item: Kiosk, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1, // Calculate serial number based on current page
          })) || [];

        setKiosks(mappedData);
        setRowCount(result.total || 0);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch data when pagination model or search changes
  useEffect(() => {
    fetchKiosks(paginationModel, debouncedSearch);
  }, [paginationModel, debouncedSearch, fetchKiosks]);

  const handlePaginationChange = (newModel: GridPaginationModel) => {
    console.log("Pagination changed:", newModel);
    setPaginationModel(newModel);
  };

  const handleDeleteClick = (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedKiosk(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedKiosk || !token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${selectedKiosk.keycloakId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to delete: ${res.status} ${res.statusText}`);
      }

      // Refresh current page after deletion
      await fetchKiosks(paginationModel, debouncedSearch);
      handleDeleteCancel();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete kiosk");
    }
  };

  const handleView = (keycloakId: string) => {
    router.push(`/admin/kiosk-management/${keycloakId}`);
  };

  const handleEdit = (keycloakId: string) => {
    router.push(`/admin/kiosk-management/edit?id=${keycloakId}`);
  };

  const handleAdd = () => {
    router.push("/admin/kiosk-management/add");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", flex: 0.3 },
      { field: "firstName", headerName: "First Name", flex: 1 },
      { field: "lastName", headerName: "Last Name", flex: 1 },
      { field: "description", headerName: "Description", flex: 1 },
      { field: "address", headerName: "Address", flex: 1 },
      { field: "countryName", headerName: "Country", flex: 1 },
      { field: "stateName", headerName: "State", flex: 1 },
      { field: "cityName", headerName: "City", flex: 1 },
      {
        field: "projectNames",
        headerName: "Related Projects",
        flex: 1.5,
        renderCell: (params) =>
          params.value?.length > 0
            ? params.value.join(", ")
            : "No Related Projects",
      },
      {
        field: "action",
        headerName: "Actions",
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row.keycloakId)}
              title="View"
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row.keycloakId)}
              title="Edit"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
              title="Delete"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Navbar label="Kiosk Management" />
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <StyledDataGrid
          rows={kiosks}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 25, 100]}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          onAdd={handleAdd}
          onSearch={handleSearch}
          searchPlaceholder="Search kiosks..."
        />

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this kiosk? This action cannot be
              undone.
            </Typography>
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
    </>
  );
};

export default KioskManagement;
