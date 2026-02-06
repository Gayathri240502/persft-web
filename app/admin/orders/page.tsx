"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button,
  useMediaQuery,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  DataGrid,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Archive, Unarchive } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";

interface DesignOrder {
  _id?: string;
  orderId: string;
  customerId: string;
  customerEmail?: string;
  projectId: string;
  status: string;
  currentPaymentStage?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  id?: string;
  sn?: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const getStatusColor = (status: string) => {
  const statusColors: {
    [key: string]:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  } = {
    created: "default",
    design_received: "info",
    booking_payment_pending: "warning",
    booking_payment_done: "success",
    processing_payment_pending: "warning",
    processing_payment_done: "success",
    pre_delivery_payment_pending: "warning",
    pre_delivery_payment_done: "success",
    completion_payment_pending: "warning",
    completion_payment_done: "success",
    cancelled: "error",
  };
  return statusColors[status] || "default";
};

const DesignOrders = () => {
  const theme = useTheme();

  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archiveLoading, setArchiveLoading] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentStageFilter, setPaymentStageFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [customerEmailFilter, setCustomerEmailFilter] = useState("");

  const debouncedSearchText = useDebounce(searchText, 500);
  const debouncedCustomerEmail = useDebounce(customerEmailFilter, 500);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { token } = useTokenAndRole();
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const page = paginationModel.page + 1;
      const limit = paginationModel.pageSize;
      const sortField = "createdAt";
      const sortOrder = "desc";

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortField);
      params.append("sortOrder", sortOrder);

      if (statusFilter) params.append("status", statusFilter);
      if (paymentStageFilter)
        params.append("currentPaymentStage", paymentStageFilter);
      if (debouncedSearchText.trim())
        params.append("orderId", debouncedSearchText.trim());
      if (debouncedCustomerEmail.trim())
        params.append("customerEmail", debouncedCustomerEmail.trim());

      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch design orders");

      const data = await res.json();
      console.log("API response:", data);

      const startIndex = (page - 1) * limit;
      const formatted = data.orders.map((item: DesignOrder, index: number) => ({
        ...item,
        id: item._id || item.orderId || `row-${index}`,
        sn: startIndex + index + 1,
      }));

      setOrders(formatted);
      setRowCount(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveToggle = async (
    orderId: string,
    currentArchiveStatus: boolean
  ) => {
    setArchiveLoading(orderId);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders/${orderId}/archive`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isArchived: !currentArchiveStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update archive status");
      }

      // Update the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, isArchived: !currentArchiveStatus }
            : order
        )
      );

      // Show success message (optional)
      console.log(
        `Order ${orderId} ${!currentArchiveStatus ? "archived" : "unarchived"} successfully`
      );
    } catch (e) {
      console.error("Archive toggle error:", e);
      setError(
        e instanceof Error ? e.message : "Failed to update archive status"
      );
    } finally {
      setArchiveLoading(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    paginationModel,
    statusFilter,
    paymentStageFilter,
    debouncedSearchText,
    debouncedCustomerEmail,
  ]);

  const handleClearFilters = () => {
    setStatusFilter("");
    setPaymentStageFilter("");
    setSearchText("");
    setCustomerEmailFilter("");
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },

    {
      field: "orderId",
      headerName: "Order ID",
      flex: 0.4,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.main, cursor: "pointer" }}
          onClick={() => router.push(`/admin/orders/${params.row.orderId}`)}
        >
          {params.row.orderId ?? "N/A"}
        </Typography>
      ),
    },

    {
      field: "customerId",
      headerName: "Customer ID",
      flex: 0.5,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "projectId",
      headerName: "Project ID",
      flex: 0.5,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "totalAmount",
      headerName: "Amount",
      flex: 0.3,
      renderCell: (params) =>
        `$${params.row.totalAmount?.toFixed(2) || "0.00"}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Stack spacing={0.5}>
          <Chip
            label={params.value.replace(/_/g, " ").toUpperCase()}
            color={getStatusColor(params.value)}
            size="small"
            variant="outlined"
            onClick={() =>
              router.push(`/admin/orders/payments/${params.row.orderId}`)
            }
            sx={{ cursor: "pointer" }}
          />
        </Stack>
      ),
    },

    {
      field: "currentPaymentStage",
      headerName: "Payment Stage",
      flex: 0.4,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value?.replace(/_/g, " ").toUpperCase() || "N/A"}
          color="primary"
          size="small"
        />
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 0.3,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={params.row.isArchived ? "Unarchive" : "Archive"}>
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  handleArchiveToggle(params.row.orderId, params.row.isArchived)
                }
                disabled={archiveLoading === params.row.orderId}
                sx={{
                  color: params.row.isArchived
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  "&:hover": {
                    backgroundColor: params.row.isArchived
                      ? theme.palette.success.light + "20"
                      : theme.palette.warning.light + "20",
                  },
                }}
              >
                {archiveLoading === params.row.orderId ? (
                  <CircularProgress size={16} />
                ) : params.row.isArchived ? (
                  <Unarchive fontSize="small" />
                ) : (
                  <Archive fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {/* Archive status indicator */}
          <Chip
            label={params.row.isArchived ? "Archived" : "Active"}
            size="small"
            variant="outlined"
            color={params.row.isArchived ? "default" : "success"}
            sx={{
              fontSize: "0.75rem",
              height: "20px",
              opacity: params.row.isArchived ? 0.7 : 1,
            }}
          />
        </Box>
      ),
    },
  ];

  const unsortableColumns = columns.map((col) => ({
    ...col,
    sortable: col.field === "actions" ? false : false, // Keep all columns unsortable as per original
  }));

  return (
    <>
      <Navbar label="Design Orders" />
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mb: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search Order ID"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by Order ID"
            sx={{ minWidth: 200 }}
            size="small"
          />
          <TextField
            label="Customer Email"
            value={customerEmailFilter}
            onChange={(e) => setCustomerEmailFilter(e.target.value)}
            placeholder="Search by Customer Email"
            sx={{ minWidth: 200 }}
            size="small"
          />
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="created">Created</MenuItem>
              <MenuItem value="design_received">Design Received</MenuItem>
              <MenuItem value="booking_payment_pending">
                Booking Payment Pending
              </MenuItem>
              <MenuItem value="booking_payment_done">
                Booking Payment Done
              </MenuItem>
              <MenuItem value="processing_payment_pending">
                Processing Payment Pending
              </MenuItem>
              <MenuItem value="processing_payment_done">
                Processing Payment Done
              </MenuItem>
              <MenuItem value="pre_delivery_payment_pending">
                Pre Delivery Payment Pending
              </MenuItem>
              <MenuItem value="pre_delivery_payment_done">
                Pre Delivery Payment Done
              </MenuItem>
              <MenuItem value="completion_payment_pending">
                Completion Payment Pending
              </MenuItem>
              <MenuItem value="completion_payment_done">
                Completion Payment Done
              </MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel id="payment-stage-label">Payment Stage</InputLabel>
            <Select
              labelId="payment-stage-label"
              label="Payment Stage"
              value={paymentStageFilter}
              onChange={(e) => setPaymentStageFilter(e.target.value)}
            >
              <MenuItem value="">All Stages</MenuItem>
              <MenuItem value="booking">Booking</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="pre_delivery">Pre Delivery</MenuItem>
              <MenuItem value="completion">Completion</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: "100%", mt: 2 }}>
            <Box
              sx={{
                width: "100%",
                height: { xs: "auto", sm: "70vh" },
                minHeight: 400,
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                },
              }}
            >
              <Box
                sx={{
                  minWidth: isMobile ? "1400px" : "100%", // Increased width for actions column
                  height: "100%",
                }}
              >
                <DataGrid
                  rows={orders}
                  columns={unsortableColumns}
                  rowCount={rowCount}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 25, 50, 100]}
                  paginationMode="server"
                  autoHeight
                  disableRowSelectionOnClick
                  getRowId={(row) => row._id || row.orderId || row.id}
                  sx={{
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#5a7299",
                      color: "#000",
                      fontWeight: 600,
                      borderBottom: "2px solid #5a7299",
                      "& .MuiDataGrid-columnHeaderTitle": {
                        color: "#000",
                        fontWeight: 600,
                        fontSize: { xs: "0.8rem", sm: "0.95rem" },
                      },
                    },
                    "& .MuiDataGrid-cell": {
                      paddingY: { xs: 0.5, sm: 1 },
                      paddingX: { xs: 1, sm: 2 },
                      borderBottom: "1px solid #e0e0e0",
                      "&:focus, &:focus-within": {
                        outline: "none",
                      },
                    },
                    "& .MuiDataGrid-row": {
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#f0e9e3 !important",
                        "&:hover": {
                          backgroundColor: "#e8ddd4 !important",
                        },
                      },
                    },
                    "& .MuiDataGrid-footerContainer": {
                      backgroundColor: "#f8f9fa",
                      borderTop: "1px solid #e0e0e0",
                      color: "#333",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                    "& .MuiDataGrid-columnSeparator": {
                      display: "none",
                    },
                    "& .MuiCheckbox-root": {
                      color: "#b37f59",
                      "&.Mui-checked": {
                        color: "#b37f59",
                      },
                    },
                    "& .MuiDataGrid-toolbarContainer": {
                      gap: 1,
                      flexWrap: "wrap",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      overflowX: "auto",
                    },
                    "& .MuiDataGrid-virtualScrollerContent": {
                      minWidth: isMobile ? "1400px" : "100%", // Increased width for actions column
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default DesignOrders;
