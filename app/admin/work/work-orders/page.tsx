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
  TextField,
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
  productId?: string;
  customerUsername?: string;
}

type FiltersType = {
  status?: string;
  includeArchived?: boolean;
  customerId?: string;
  customerEmail?: string;
  designOrderId?: string;
  workOrderId?: string;
  projectId?: string;
  createdAfter?: string; // datetime-local string
  createdBefore?: string;
  expectedCompletionAfter?: string;
  expectedCompletionBefore?: string;
};

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setDebouncedValue(value),
      delay
    );
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

const isoFromInput = (val?: string) => {
  if (!val) return undefined;
  // input[type=datetime-local] produces "YYYY-MM-DDTHH:MM"
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

const normalizeWorkOrders = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.workOrders)) return data.workOrders;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (data.data && Array.isArray(data.data.items)) return data.data.items;
  if (data.payload && Array.isArray(data.payload.items))
    return data.payload.items;
  return [];
};

const UpdateWorkOrdersPage: React.FC = () => {
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

  const [filters, setFilters] = useState<FiltersType>({
    status: "",
    includeArchived: false,
    customerId: "",
    customerEmail: "",
    designOrderId: "",
    workOrderId: "",
    projectId: "",
    createdAfter: "",
    createdBefore: "",
    expectedCompletionAfter: "",
    expectedCompletionBefore: "",
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "status", sort: "asc" },
  ]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWorkOrders = useCallback(async () => {
    if (!token) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page + 1));
    queryParams.append("limit", String(pageSize));

    if (debouncedSearch && debouncedSearch.trim())
      queryParams.append("search", debouncedSearch.trim());
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.customerId)
      queryParams.append("customerId", filters.customerId);
    if (filters.customerEmail)
      queryParams.append("customerEmail", filters.customerEmail);
    if (filters.designOrderId)
      queryParams.append("designOrderId", filters.designOrderId);
    if (filters.workOrderId)
      queryParams.append("workOrderId", filters.workOrderId);
    if (filters.projectId) queryParams.append("projectId", filters.projectId);

    // Date filters -> convert to ISO if possible
    const createdAfterIso = isoFromInput(filters.createdAfter);
    const createdBeforeIso = isoFromInput(filters.createdBefore);
    const expectedAfterIso = isoFromInput(filters.expectedCompletionAfter);
    const expectedBeforeIso = isoFromInput(filters.expectedCompletionBefore);

    if (createdAfterIso) queryParams.append("createdAfter", createdAfterIso);
    if (createdBeforeIso) queryParams.append("createdBefore", createdBeforeIso);
    if (expectedAfterIso)
      queryParams.append("expectedCompletionAfter", expectedAfterIso);
    if (expectedBeforeIso)
      queryParams.append("expectedCompletionBefore", expectedBeforeIso);

    if (typeof filters.includeArchived === "boolean")
      queryParams.append("includeArchived", String(filters.includeArchived));

    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      if (field) queryParams.append("sortBy", field);
      queryParams.append("sortOrder", sort || "asc");
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/work-orders?${queryParams.toString()}`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      });

      if (!res.ok) {
        let errorText = await res.text();
        try {
          const parsed = JSON.parse(errorText);
          errorText = parsed.message || parsed.error || errorText;
        } catch {
          /* keep original */
        }
        throw new Error(
          `Failed to fetch work orders: ${res.status} ${res.statusText} - ${errorText}`
        );
      }

      const data = await res.json();

      const workOrdersArray = normalizeWorkOrders(data);
      const totalCount =
        typeof data.total === "number"
          ? data.total
          : Array.isArray(workOrdersArray)
            ? workOrdersArray.length
            : 0;

      const transformedPromises = workOrdersArray.map(
        async (item: any, index: number) => {
          let currentPhase = "No phases";
          if (item.currentPhase && item.currentPhase !== "No phases") {
            currentPhase = item.currentPhase;
          } else if (
            Array.isArray(item.executionPlan) &&
            item.executionPlan.length > 0
          ) {
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

          let merchantAssignmentsCount: number | "N/A" = "N/A";
          let totalProducts: number | "N/A" = "N/A";
          let assignedProducts: number | "N/A" = "N/A";
          let productId: string | undefined = undefined;

          try {
            const targetWorkOrderId = item.workOrderId || item._id || item.id;
            if (targetWorkOrderId) {
              const merchantRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${targetWorkOrderId}/merchant-assignments`,
                { headers: { Authorization: `Bearer ${token}` }, signal }
              );
              if (merchantRes.ok) {
                const merchantData = await merchantRes.json();
                merchantAssignmentsCount = Array.isArray(
                  merchantData.assignments
                )
                  ? merchantData.assignments.length
                  : merchantData.assignments
                    ? 1
                    : 0;
                totalProducts = merchantData.totalProducts ?? "N/A";
                assignedProducts = merchantData.assignedProducts ?? "N/A";
                if (
                  Array.isArray(merchantData.assignments) &&
                  merchantData.assignments.length > 0
                ) {
                  productId = merchantData.assignments[0].productId;
                }
              } else {
                console.warn(
                  `Merchant assignments fetch failed for ${targetWorkOrderId}:`,
                  merchantRes.status,
                  merchantRes.statusText
                );
              }
            }
          } catch (merchantErr: any) {
            if (merchantErr?.name === "AbortError") throw merchantErr;
            console.error("Merchant assignments fetch error:", merchantErr);
          }

          return {
            id: item._id || item.id || `${item.workOrderId || index}`,
            workOrderId: item.workOrderId || "N/A",
            designOrderId: item.designOrderId || "N/A",
            status: item.status || "N/A",
            currentPhase,
            sn: page * pageSize + index + 1,
            merchantAssignmentsCount,
            totalProducts,
            assignedProducts,
            productId,
            customerUsername:
              item.customerUsername ||
              item.customerEmail ||
              `${item.customerFirstName || ""} ${item.customerLastName || ""}`.trim() ||
              "N/A",
          } as WorkOrder;
        }
      );

      const transformed = await Promise.all(transformedPromises);
      setRows(transformed);
      setRowCount(Number(totalCount) || transformed.length);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filters, token, sortModel]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [
    debouncedSearch,
    filters.status,
    filters.includeArchived,
    filters.customerId,
    filters.customerEmail,
    filters.designOrderId,
    filters.workOrderId,
    filters.projectId,
    filters.createdAfter,
    filters.createdBefore,
    filters.expectedCompletionAfter,
    filters.expectedCompletionBefore,
  ]);

  useEffect(() => {
    fetchWorkOrders();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchWorkOrders, reloadFlag]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);
  const handlePaginationChange = useCallback(
    (newModel: GridPaginationModel) => setPaginationModel(newModel),
    []
  );
  const handleFilterChange = useCallback(
    (field: string, value: any) =>
      setFilters((prev) => ({ ...prev, [field]: value })),
    []
  );
  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => setSortModel(newModel),
    []
  );

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
      setLoading(true);
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
        const text = await res.text();
        throw new Error(text || `Failed to delete work order (${res.status})`);
      }
      setReloadFlag((prev) => !prev);
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete work order"
      );
    } finally {
      handleDeleteCancel();
      setLoading(false);
    }
  }, [selectedDeleteId, token, handleDeleteCancel]);

  const handleView = useCallback(
    (workOrderId: string) => {
      if (!workOrderId) {
        setError("No work order ID to view.");
        return;
      }
      router.push(`/admin/work/work-orders/${workOrderId}`);
    },
    [router]
  );

  const handleAssignMerchant = useCallback(
    (workOrder: WorkOrder) => {
      if (!workOrder?.workOrderId) {
        setError("No Work Order ID available.");
        return;
      }
      router.push(
        `/admin/work/work-orders/assign-merchant?workOrderId=${encodeURIComponent(workOrder.workOrderId)}${workOrder.productId ? `&productId=${encodeURIComponent(workOrder.productId)}` : ""}`
      );
    },
    [router]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", width: 60, sortable: false },
      {
        field: "customerUsername",
        headerName: "Customer",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "workOrderId",
        headerName: "Work Order ID",
        flex: 1.5,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
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
        width: 70,
        sortable: false,
      },
      {
        field: "assignedProducts",
        headerName: "Assigned Products",
        width: 70,
        sortable: false,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={(params.value as string)?.toUpperCase() || "N/A"}
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
    [handleView, handleAssignMerchant, handleDeleteClick]
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
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
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
                  checked={Boolean(filters.includeArchived)}
                  onChange={(e) =>
                    handleFilterChange("includeArchived", e.target.checked)
                  }
                />
              }
              label="Include Archived"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Customer ID"
              value={filters.customerId}
              onChange={(e) => handleFilterChange("customerId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Customer Email"
              value={filters.customerEmail}
              onChange={(e) =>
                handleFilterChange("customerEmail", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Design Order ID"
              value={filters.designOrderId}
              onChange={(e) =>
                handleFilterChange("designOrderId", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Work Order ID"
              value={filters.workOrderId}
              onChange={(e) =>
                handleFilterChange("workOrderId", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Project ID"
              value={filters.projectId}
              onChange={(e) => handleFilterChange("projectId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Created After"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={filters.createdAfter}
              onChange={(e) =>
                handleFilterChange("createdAfter", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Created Before"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={filters.createdBefore}
              onChange={(e) =>
                handleFilterChange("createdBefore", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Expected Completion After"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={filters.expectedCompletionAfter}
              onChange={(e) =>
                handleFilterChange("expectedCompletionAfter", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Expected Completion Before"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={filters.expectedCompletionBefore}
              onChange={(e) =>
                handleFilterChange("expectedCompletionBefore", e.target.value)
              }
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
