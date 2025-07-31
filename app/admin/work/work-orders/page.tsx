"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import {
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { Delete, Visibility } from "@mui/icons-material";

import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import Navbar from "@/app/components/navbar/navbar";
import { useRouter } from "next/navigation";

interface WorkOrder {
  id: string;
  workOrderId: string;
  designOrderId: string;
  status: string;
  currentPhase: string;
  sn: number;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UpdateWorkOrdersPage = () => {
  const { token } = useTokenAndRole();
  const router = useRouter();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [rows, setRows] = useState<WorkOrder[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    includeArchived: false,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "status", sort: "asc" },
  ]);

  const fetchWorkOrders = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;

    const queryParams = new URLSearchParams({
      page: String(page + 1),
      limit: String(pageSize),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.status && { status: filters.status }),
      includeArchived: String(filters.includeArchived),
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch work orders");

      const data = await res.json();
      console.log("API Response:", data); // Debug log to check data structure

      const transformed = (data.workOrders || []).map(
        (item: any, index: number) => {
          // Enhanced current phase extraction with multiple fallbacks
          let currentPhase = "Not Started";

          // Try different possible data structures
          if (item.executionPlan?.currentPhase?.name) {
            currentPhase = item.executionPlan.currentPhase.name;
          } else if (item.executionPlan?.currentPhase) {
            currentPhase = item.executionPlan.currentPhase;
          } else if (item.currentPhase?.name) {
            currentPhase = item.currentPhase.name;
          } else if (item.currentPhase) {
            currentPhase = item.currentPhase;
          } else if (item.phase?.name) {
            currentPhase = item.phase.name;
          } else if (item.phase) {
            currentPhase = item.phase;
          }

          console.log(
            `Work Order ${item.workOrderId} - Current Phase:`,
            currentPhase
          ); // Debug log

          return {
            id: item._id,
            workOrderId: item.workOrderId,
            designOrderId: item.designOrderId ?? "N/A",
            status: item.status,
            currentPhase,
            sn: page * pageSize + index + 1,
          };
        }
      );

      setRows(transformed);
      setRowCount(data.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filters, token]);

  // Reset pagination when search changes
  useEffect(() => {
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [debouncedSearch]);

  // Reset pagination when filters change
  useEffect(() => {
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [filters.status, filters.includeArchived]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders, reloadFlag]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handlePaginationChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel);
  };

  const handleDeleteClick = (id: string) => {
    console.log("Selected delete ID:", id);
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId || !token) return;

    console.log("Attempting to delete work order:", selectedDeleteId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await res.text();
      console.log("Delete response status:", res.status);
      console.log("Delete response text:", responseText);

      if (!res.ok) {
        throw new Error(responseText || "Failed to delete work order");
      }

      // Refresh data
      setReloadFlag((prev) => !prev);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      handleDeleteCancel();
    }
  };

  const handleView = (workOrderId: string) => {
    router.push(`/admin/work/work-orders/${workOrderId}`);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", width: 70, sortable: false },
      {
        field: "workOrderId",
        headerName: "Work Order ID",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Typography
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => handleView(params.row.workOrderId)}
          >
            {params.row.workOrderId}
          </Typography>
        ),
      },
      {
        field: "designOrderId",
        headerName: "Design Order ID",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "currentPhase",
        headerName: "Current Phase",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1,
        minWidth: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row.workOrderId)}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.workOrderId)}
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
      <Navbar label="Update Work Orders" />
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.includeArchived}
                  onChange={(e) =>
                    handleFilterChange("includeArchived", e.target.checked)
                  }
                />
              }
              label="Include Archived"
            />
          </Grid>
        </Grid>

        <StyledDataGrid
          rows={rows}
          columns={columns}
          disableAllSorting
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          paginationMode="server"
          sortingMode="client"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          onSearch={handleSearch}
          searchPlaceholder="Search Work Orders..."
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this work order?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default UpdateWorkOrdersPage;
