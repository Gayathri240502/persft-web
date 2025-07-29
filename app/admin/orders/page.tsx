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
  Stack,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  DataGrid,
  GridRenderCellParams,
} from "@mui/x-data-grid";
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

  const { token } = useTokenAndRole();

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

  const router = useRouter();
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
          />
          <Typography
            variant="body2"
            sx={{ color: theme.palette.primary.main, cursor: "pointer" }}
            onClick={() =>
              router.push(`/admin/orders/payments/${params.row.orderId}`)
            }
          >
            {params.row.orderId ?? "N/A"}
          </Typography>
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
  ];

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
          <Box sx={{ minWidth: 1500 }}>
            <DataGrid
              rows={orders}
              columns={columns}
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              paginationMode="server"
              autoHeight
              disableRowSelectionOnClick
              getRowId={(row) => row._id || row.orderId || row.id}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default DesignOrders;
