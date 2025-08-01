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

    // Build query parameters properly
    const queryParams = new URLSearchParams();

    // Pagination - convert to 1-based indexing for API
    queryParams.append("page", String(page + 1));
    queryParams.append("limit", String(pageSize));

    // Search filter
    if (debouncedSearch.trim()) {
      queryParams.append("search", debouncedSearch.trim());
    }

    // Status filter
    if (filters.status) {
      queryParams.append("status", filters.status);
    }

    // Archive filter
    queryParams.append("includeArchived", String(filters.includeArchived));

    // Sort parameters
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      queryParams.append("sortBy", field);
      queryParams.append("sortOrder", sort || "asc");
    }

    console.log("Query Parameters:", queryParams.toString()); // Debug log

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/work-orders?${queryParams.toString()}`;
      console.log("API URL:", url); // Debug log

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to fetch work orders: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("API Response:", data); // Debug log to check data structure

      // Handle different possible response structures
      const workOrdersArray = data.workOrders || data.data || data || [];
      const totalCount =
        data.total || data.totalCount || data.count || workOrdersArray.length;

      const transformed = workOrdersArray.map((item: any, index: number) => {
        // Enhanced current phase extraction with multiple fallbacks
        let currentPhase = "No phases";

        // Try different possible data structures for current phase
        if (item.currentPhase && item.currentPhase !== "No phases") {
          currentPhase = item.currentPhase;
        } else if (item.executionPlan?.length > 0) {
          // Find the current active phase from execution plan
          const activePhase = item.executionPlan.find(
            (phase: any) =>
              phase.status === "started" || phase.status === "active"
          );
          if (activePhase) {
            currentPhase =
              activePhase.workGroupName || activePhase.name || "In Progress";
          } else {
            // If no active phase, get the first phase name
            const firstPhase = item.executionPlan[0];
            currentPhase =
              firstPhase?.workGroupName || firstPhase?.name || "Planned";
          }
        }

        console.log(
          `Work Order ${item.workOrderId} - Current Phase:`,
          currentPhase
        ); // Debug log

        return {
          id: item._id,
          workOrderId: item.workOrderId,
          designOrderId: item.designOrderId || "N/A",
          status: item.status,
          currentPhase,
          sn: page * pageSize + index + 1,
        };
      });

      setRows(transformed);
      setRowCount(totalCount);

      console.log("Transformed rows:", transformed.length);
      console.log("Total count:", totalCount);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filters, token, sortModel]);

  // Reset pagination when search changes
  useEffect(() => {
    console.log("Search changed, resetting pagination");
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [debouncedSearch]);

  // Reset pagination when filters change
  useEffect(() => {
    console.log("Filters changed, resetting pagination");
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [filters.status, filters.includeArchived]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders, reloadFlag]);

  const handleSearch = useCallback((value: string) => {
    console.log("Search input changed:", value);
    setSearch(value);
  }, []);

  const handlePaginationChange = (newModel: GridPaginationModel) => {
    console.log("Pagination changed:", newModel);
    setPaginationModel(newModel);
  };

  const handleFilterChange = (field: string, value: any) => {
    console.log(`Filter changed - ${field}:`, value);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSortModelChange = (newModel: GridSortModel) => {
    console.log("Sort model changed:", newModel);
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

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete work order");
      }

      // Refresh data
      setReloadFlag((prev) => !prev);

      // Show success message (optional)
      console.log("Work order deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete work order"
      );
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
            sx={{ cursor: "pointer", textDecoration: "underline" }}
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
        renderCell: (params) => (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor:
                params.value === "completed"
                  ? "success.light"
                  : params.value === "active"
                    ? "info.light"
                    : params.value === "pending"
                      ? "warning.light"
                      : params.value === "cancelled"
                        ? "error.light"
                        : "grey.light",
              color: "white",
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            {params.value?.toUpperCase()}
          </Box>
        ),
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
              title="View Details"
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.workOrderId)}
              title="Delete Work Order"
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                label="Status"
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          disableAllSorting={false}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          onSearch={handleSearch}
          searchPlaceholder="Search Work Orders..."
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this work order? This action
              cannot be undone.
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
