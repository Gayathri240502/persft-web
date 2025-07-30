"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
  Chip,
  Menu,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";

interface WorkOrder {
  id: string;
  workOrderId: string;
  workGroupId: string | null;
  status: string;
  customerEmail: string;
  projectName: string;
  createdAt: string;
  sn: number;
}

const normalizeStatus = (
  status: string
): "pending" | "active" | "completed" | "cancelled" => {
  const map: Record<string, "pending" | "active" | "completed" | "cancelled"> =
    {
      pending: "pending",
      started: "active",
      inprogress: "active",
      in_progress: "active",
      delayed: "active",
      active: "active",
      completed: "completed",
      cancelled: "cancelled",
    };
  return map[status.toLowerCase()] ?? "pending";
};

const UpdateWorkOrdersPage = () => {
  const theme = useTheme();
  const { token } = useTokenAndRole();
  const router = useRouter();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [rows, setRows] = useState<WorkOrder[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  // Updated status menu state to match tickets pattern
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [updatingStatuses, setUpdatingStatuses] = useState<Set<string>>(
    new Set()
  );

  const [filters, setFilters] = useState({
    status: "",
    customerId: "",
    customerEmail: "",
    designOrderId: "",
    workOrderId: "",
    projectId: "",
    createdAfter: "",
    createdBefore: "",
    expectedCompletionAfter: "",
    expectedCompletionBefore: "",
    includeArchived: false,
  });

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (normalizeStatus(status)) {
      case "pending":
        return "default";
      case "active":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const fetchWorkOrders = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;
    const queryParams = new URLSearchParams({
      page: String(page + 1),
      limit: String(pageSize),
      ...(search && { search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.customerEmail && { customerEmail: filters.customerEmail }),
      ...(filters.designOrderId && { designOrderId: filters.designOrderId }),
      ...(filters.workOrderId && { workOrderId: filters.workOrderId }),
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(filters.createdAfter && { createdAfter: filters.createdAfter }),
      ...(filters.createdBefore && { createdBefore: filters.createdBefore }),
      ...(filters.expectedCompletionAfter && {
        expectedCompletionAfter: filters.expectedCompletionAfter,
      }),
      ...(filters.expectedCompletionBefore && {
        expectedCompletionBefore: filters.expectedCompletionBefore,
      }),
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

      if (mountedRef.current) {
        const transformed = (data.workOrders || []).map(
          (item: any, index: number) => {
            const groupId =
              item.workGroupId ??
              item.groupId ??
              (item.executionPlan?.length > 0
                ? item.executionPlan[0]?.groupId
                : null) ??
              null;

            if (!groupId) {
              console.warn(
                `Missing groupId for workOrderId: ${item.workOrderId}`
              );
            }

            return {
              id: item._id,
              workOrderId: item.workOrderId,
              workGroupId: groupId,
              status: normalizeStatus(item.status),
              customerEmail: item.customerEmail,
              projectName: item.project?.name ?? "N/A",
              createdAt: item.createdAt,
              sn: page * pageSize + index + 1,
            };
          }
        );

        setRows(transformed);
        setRowCount(data.total || 0);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [paginationModel, search, filters, token]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Updated status menu handlers to match tickets pattern
  const handleStatusMenuClick = (
    workOrderId: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setStatusMenuAnchor((prev) => ({
      ...prev,
      [workOrderId]: event.currentTarget,
    }));
  };

  const handleStatusMenuClose = (workOrderId: string) => {
    setStatusMenuAnchor((prev) => ({
      ...prev,
      [workOrderId]: null,
    }));
  };

  const handleStatusChange = async (workOrderId: string, newStatus: string) => {
    const workOrder = rows.find((row) => row.workOrderId === workOrderId);
    if (!workOrder?.workGroupId) {
      console.error("Missing workOrderId or groupId");
      setError("Missing work order or group ID for status update");
      return;
    }

    setUpdatingStatuses((prev) => new Set(prev).add(workOrderId));

    try {
      console.log("Updating status:", {
        workOrderId,
        groupId: workOrder.workGroupId,
        newStatus,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}/groups/${workOrder.workGroupId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Status update failed:", errorData);
        throw new Error(errorData.message || "Failed to update status");
      }

      await fetchWorkOrders();
      setError(null);
    } catch (err) {
      console.error("Error updating status:", err);
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to update status"
        );
      }
    } finally {
      if (mountedRef.current) {
        setUpdatingStatuses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(workOrderId);
          return newSet;
        });
        handleStatusMenuClose(workOrderId);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handlePaginationChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handleDeleteConfirm = () => {
    alert(`Delete logic for ID: ${selectedDeleteId}`);
    handleDeleteCancel();
  };

  const handleView = (workOrderId: string) => {
    router.push(`/admin/work/work-orders/${workOrderId}`);
  };

  const handleEdit = (workOrderId: string) => {
    router.push(`/admin/work/work-orders/${workOrderId}`);
  };

  const handleAdd = () => alert("Add new Work Order");

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", width: 70 },
      {
        field: "workOrderId",
        headerName: "Work Order ID",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.primary.main, cursor: "pointer" }}
            onClick={() => handleView(params.row.workOrderId)}
          >
            {params.row.workOrderId ?? "N/A"}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 140,
        renderCell: (params) => {
          const hasGroupId = !!params.row.workGroupId;
          const isUpdating = updatingStatuses.has(params.row.workOrderId);

          return (
            <Chip
              label={params.value.replace("_", " ")}
              color={getStatusColor(params.value)}
              size="small"
              variant="outlined"
              onClick={(e) => {
                if (hasGroupId && !isUpdating) {
                  handleStatusMenuClick(params.row.workOrderId, e);
                } else if (!hasGroupId) {
                  console.warn("Group ID missing. Cannot update status.");
                }
              }}
              sx={{
                cursor: hasGroupId && !isUpdating ? "pointer" : "default",
                opacity: hasGroupId && !isUpdating ? 1 : 0.5,
              }}
              disabled={isUpdating}
            />
          );
        },
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1,
        minWidth: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row.workOrderId)}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row.workOrderId)}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [theme.palette.primary.main, updatingStatuses]
  );

  return (
    <>
      <Navbar label="Update Work Orders" />
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Customer Email"
              fullWidth
              size="small"
              value={filters.customerEmail}
              onChange={(e) =>
                handleFilterChange("customerEmail", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Project ID"
              fullWidth
              size="small"
              value={filters.projectId}
              onChange={(e) => handleFilterChange("projectId", e.target.value)}
            />
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

        {/* Table */}
        <StyledDataGrid
          rows={rows}
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

        {/* Status Change Menus - Updated to match tickets pattern */}
        {rows.map((workOrder) => (
          <Menu
            key={`menu-${workOrder.workOrderId}`}
            anchorEl={statusMenuAnchor[workOrder.workOrderId]}
            open={Boolean(statusMenuAnchor[workOrder.workOrderId])}
            onClose={() => handleStatusMenuClose(workOrder.workOrderId)}
          >
            {["pending", "active", "completed", "cancelled"].map((status) => (
              <MenuItem
                key={status}
                onClick={() =>
                  handleStatusChange(workOrder.workOrderId, status)
                }
                disabled={
                  workOrder.status === status ||
                  updatingStatuses.has(workOrder.workOrderId)
                }
              >
                <ListItemText>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </ListItemText>
              </MenuItem>
            ))}
          </Menu>
        ))}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this work order?
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
    </>
  );
};

export default UpdateWorkOrdersPage;
