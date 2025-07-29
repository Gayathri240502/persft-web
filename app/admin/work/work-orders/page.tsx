"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  status: string;
  customerEmail: string;
  projectName: string;
  createdAt: string;
  sn: number;
}

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
      const transformed = (data.workOrders || []).map(
        (item: any, index: number) => ({
          id: item._id,
          workOrderId: item.workOrderId,
          status: item.status,
          customerEmail: item.customerEmail,
          projectName: item.project?.name ?? "N/A",
          createdAt: item.createdAt,
          sn: page * pageSize + index + 1,
        })
      );

      setRows(transformed);
      setRowCount(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search, filters, token]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

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
        renderCell: (params: any) => (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.primary.main, cursor: "pointer" }}
            onClick={() => handleView(params.row.workOrderId)}
          >
            {params.row.workOrderId ?? "N/A"}
          </Typography>
        ),
      },

      { field: "status", headerName: "Status", flex: 1, minWidth: 120 },
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
    [theme.palette.primary.main]
  );

  return (
    <>
      <Navbar label="Update Work Orders" />

      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}

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
                <MenuItem value="started">Started</MenuItem>
                <MenuItem value="inprogress">In Progress</MenuItem>
                <MenuItem value="delayed">Delayed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
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
