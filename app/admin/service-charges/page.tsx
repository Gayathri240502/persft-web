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
  Chip,
} from "@mui/material";

import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { Edit, Delete, ToggleOn, ToggleOff, Visibility } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface ServiceCharge {
  _id: string;
  code: string;
  name: string;
  type: string;
  calculationMethod: string;

  // 🟢 Newly added based on API response
  pricing?: Record<string, number>;
  perSqftRate?: number;
  value?: number;
  percentageBase?: string;

  isActive: boolean;
  id?: string;
  sn?: number;

  // computed field
  dynamicValue?: string;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/service-charges`;

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const ServiceChargesPage = () => {
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<ServiceCharge[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ServiceCharge | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearch]);

  // Format dynamic value column based on calculation method
  const computeDisplayValue = (item: ServiceCharge) => {
    switch (item.calculationMethod) {
      case "flat_rate":
        return `2BHK: ₹${item.pricing?.["2bhk"] || 0}, 3BHK: ₹${item.pricing?.["3bhk"] || 0}`;

      case "per_sqft":
        return `${item.perSqftRate || 0} / sqft`;

      case "percentage":
        return `${item.value || 0}% of ${item.percentageBase?.replace("_", " ")}`;

      default:
        return "-";
    }
  };

  const fetchItems = useCallback(
    async (currentPaginationModel: GridPaginationModel, searchTerm: string) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const { page, pageSize } = currentPaginationModel;

        const query = new URLSearchParams({
          page: String(page + 1),
          limit: String(pageSize),
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
        });

        const res = await fetch(`${API_BASE_URL}?${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const result = await res.json();

        const mapped =
          result.data?.map((item: ServiceCharge, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
            dynamicValue: computeDisplayValue(item), //💥 FIXED
          })) || [];

        setItems(mapped);
        setRowCount(result.total || 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch service charges.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchItems(paginationModel, debouncedSearch);
  }, [paginationModel, debouncedSearch, fetchItems]);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleAdd = () => router.push("/admin/service-charges/add");

  const handleEdit = (id: string) => router.push(`/admin/service-charges/edit?id=${id}`);

  const handleViewDetails = (id: string) => {
    router.push(`/admin/service-charges/${id}`);
  };

  const handleToggle = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Toggle failed`);

      fetchItems(paginationModel, debouncedSearch);
    } catch {
      setError("Failed to update active status.");
    }
  };

  const handleDeleteClick = (item: ServiceCharge) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${selectedItem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchItems(paginationModel, debouncedSearch);
      handleDeleteCancel();
    } catch {
      setError("Failed to delete service charge.");
    }
  };

  const handleSearch = (v: string) => setSearch(v);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", flex: 0.3 },
      { field: "code", headerName: "Code", flex: 1 },
      { field: "name", headerName: "Name", flex: 1.2 },
      { field: "type", headerName: "Type", flex: 1 },
      { field: "calculationMethod", headerName: "Calculation", flex: 1 },

      {
        field: "dynamicValue",
        headerName: " Pricing",
        flex: 1.5,
      },

      {
        field: "isActive",
        headerName: "Status",
        flex: 0.8,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Active" color="success" size="small" />
          ) : (
            <Chip label="Inactive" color="default" size="small" />
          ),
      },

      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        flex: 1.5,
        renderCell: (params) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              color="info"
              onClick={() => handleViewDetails(params.row._id)}
              title="View Details"
            >
              <Visibility fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row._id)}
              title="Edit"
            >
              <Edit fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color={params.row.isActive ? "warning" : "success"}
              onClick={() => handleToggle(params.row._id)}
              title={params.row.isActive ? "Deactivate" : "Activate"}
            >
              {params.row.isActive ? (
                <ToggleOff fontSize="small" />
              ) : (
                <ToggleOn fontSize="small" />
              )}
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
      <Navbar label="Service Charges" />
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <StyledDataGrid
          rows={items}
          columns={columns}
          disableAllSorting
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
          searchPlaceholder="Search service charges..."
        />

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Do you really want to delete the service charge "
              {selectedItem?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ServiceChargesPage;
