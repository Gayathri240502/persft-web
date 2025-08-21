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
  Chip,
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
  merchantAssignmentsCount: number | "N/A";
  totalProducts: number | "N/A";
  assignedProducts: number | "N/A";
  productId?: string; // Added productId
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
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page + 1));
    queryParams.append("limit", String(pageSize));
    if (debouncedSearch.trim())
      queryParams.append("search", debouncedSearch.trim());
    if (filters.status) queryParams.append("status", filters.status);
    queryParams.append("includeArchived", String(filters.includeArchived));
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      queryParams.append("sortBy", field);
      queryParams.append("sortOrder", sort || "asc");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch work orders: ${res.status} ${res.statusText} - ${errorText}`
        );
      }

      const data = await res.json();
      const workOrdersArray = data.workOrders || data.data || data || [];
      const totalCount =
        data.total || data.totalCount || data.count || workOrdersArray.length;

      const transformedPromises = workOrdersArray.map(
        async (item: any, index: number) => {
          // Determine current phase
          let currentPhase = "No phases";
          if (item.currentPhase && item.currentPhase !== "No phases") {
            currentPhase = item.currentPhase;
          } else if (item.executionPlan?.length > 0) {
            const activePhase = item.executionPlan.find(
              (phase: any) =>
                phase.status === "started" || phase.status === "active"
            );
            if (activePhase)
              currentPhase =
                activePhase.workGroupName || activePhase.name || "In Progress";
            else {
              const firstPhase = item.executionPlan[0];
              currentPhase =
                firstPhase?.workGroupName || firstPhase?.name || "Planned";
            }
          }

          // Fetch merchant assignments
          let merchantAssignmentsCount: number | "N/A" = "N/A";
          let totalProducts: number | "N/A" = "N/A";
          let assignedProducts: number | "N/A" = "N/A";
          let productId: string | undefined = undefined;

          try {
            const merchantRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${item.workOrderId}/merchant-assignments`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (merchantRes.ok) {
              const merchantData = await merchantRes.json();
              merchantAssignmentsCount = Array.isArray(merchantData.assignments)
                ? merchantData.assignments.length
                : 0;
              totalProducts = merchantData.totalProducts ?? "N/A";
              assignedProducts = merchantData.assignedProducts ?? "N/A";

              // ✅ Use the first product in assignments for "Assign Merchant"
              if (
                Array.isArray(merchantData.assignments) &&
                merchantData.assignments.length > 0
              ) {
                productId = merchantData.assignments[0].productId;
              }
            }
          } catch (merchantErr) {
            console.error("Merchant assignments fetch error:", merchantErr);
          }

          return {
            id: item._id,
            workOrderId: item.workOrderId,
            designOrderId: item.designOrderId || "N/A",
            status: item.status,
            currentPhase,
            sn: page * pageSize + index + 1,
            merchantAssignmentsCount,
            totalProducts,
            assignedProducts,
            productId,
          };
        }
      );

      const transformed = await Promise.all(transformedPromises);
      setRows(transformed);
      setRowCount(totalCount);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filters, token, sortModel]);

  useEffect(
    () => setPaginationModel((prev) => ({ ...prev, page: 0 })),
    [debouncedSearch, filters.status, filters.includeArchived]
  );

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders, reloadFlag]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);
  const handlePaginationChange = (newModel: GridPaginationModel) =>
    setPaginationModel(newModel);
  const handleFilterChange = (field: string, value: any) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const handleSortModelChange = (newModel: GridSortModel) =>
    setSortModel(newModel);
  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId || !token) return;
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
      if (!res.ok)
        throw new Error((await res.text()) || "Failed to delete work order");
      setReloadFlag((prev) => !prev);
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete work order"
      );
    } finally {
      handleDeleteCancel();
    }
  };
  const handleView = (workOrderId: string) =>
    router.push(`/admin/work/work-orders/${workOrderId}`);

  const handleAssignMerchant = (workOrder: WorkOrder) => {
    if (!workOrder?.workOrderId) {
      alert("No Work Order ID available.");
      return;
    }

    router.push(
      `/admin/work/work-orders/assign-merchant?workOrderId=${workOrder.workOrderId}`
    );
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", width: 70, sortable: false },
      {
        field: "workOrderId",
        headerName: "Work Order ID",
        flex: 1.5,
        minWidth: 200,
        renderCell: (params) => (
          <Typography
            color="primary"
            variant="body2"
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
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "totalProducts",
        headerName: "Total Products",
        width: 140,
        sortable: false,
      },
      {
        field: "assignedProducts",
        headerName: "Assigned Products",
        width: 160,
        sortable: false,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            label={params.value?.toUpperCase() || "N/A"}
            size="small"
            color={
              params.value === "completed"
                ? "success"
                : params.value === "active"
                  ? "info"
                  : params.value === "pending"
                    ? "warning"
                    : params.value === "cancelled"
                      ? "error"
                      : "default"
            }
          />
        ),
      },
      {
        field: "currentPhase",
        headerName: "Current Phase",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "assignMerchant",
        headerName: "Assign Merchant",
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label="Assign"
            color="primary"
            clickable
            onClick={() => handleAssignMerchant(params.row)}
          />
        ),
      },

      {
        field: "action",
        headerName: "Action",
        width: 120,
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
    [handleView]
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

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                label="Status"
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

        {/* Data Grid */}
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

        {/* Delete Confirmation */}
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
