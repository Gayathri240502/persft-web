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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import {
  GridColDef,
  GridPaginationModel,
  DataGrid,
  GridSortModel,
  GridSortDirection,
} from "@mui/x-data-grid";

interface DesignPayment {
  _id: string;
  amount: number;
  orderId: string;
  paymentId: string;
  validUntil: string;
  isValid: boolean;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
  };
  project: {
    id: string | null;
    name: string;
  };
  id?: string;
  sn?: number;
}

// debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const DesignPayments = () => {
  const theme = useTheme();

  const [payments, setPayments] = useState<DesignPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  // Filters
  const [isValid, setIsValid] = useState<string>("true"); // default "true"
  const [searchText, setSearchText] = useState("");

  const debouncedSearchText = useDebounce(searchText, 500); // 500ms debounce

  // Sorting
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "desc" as GridSortDirection },
  ]);

  const { token } = useTokenAndRole();

  // helper to detect a 24-char hex id (common Mongo _id)
  const looksLikeObjectId = (s: string) => /^[a-fA-F0-9]{24}$/.test(s);

  const fetchPayments = async () => {
    setError(null);

    if (!token) {
      setError("Missing auth token. Please log in again.");
      return;
    }

    if (isValid === "") {
      setError("Please select validity status before searching.");
      return;
    }

    setLoading(true);

    try {
      const page = paginationModel.page + 1;
      const limit = paginationModel.pageSize;

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("isValid", isValid);

      // sorting fields from DataGrid sortModel
      const sortField = sortModel[0]?.field || "createdAt";
      const sortOrder = sortModel[0]?.sort || "desc";
      params.append("sortField", sortField);
      params.append("sortOrder", sortOrder);

      const trimmed = debouncedSearchText?.trim() ?? "";

      if (trimmed) {
        if (looksLikeObjectId(trimmed)) {
          // If user entered an ID-like string, send it as exact filters.
          // (Do NOT also send `search` to avoid conflicts on backend.)
          params.append("customerId", trimmed);
          params.append("projectId", trimmed);
        } else {
          // For normal free-text searches, use `search` param which the API uses
          params.append("search", trimmed);
        }
      }

      const url = `${
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
      }/design-payments?${params.toString()}`;

      // DEBUG logs
      console.debug("[DesignPayments] Fetch URL:", url);
      console.debug(
        "[DesignPayments] Request headers: Authorization:",
        token ? "present" : "missing"
      );

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.debug("[DesignPayments] Response status:", res.status, res.statusText);

      const text = await res.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!res.ok) {
        const serverMsg = data?.message || JSON.stringify(data);
        throw new Error(`API error ${res.status}: ${serverMsg}`);
      }

      const paymentsArray = data.payments || data.data?.payments || data.items || [];
      const total =
        data.total ??
        data.count ??
        data.totalPages ??
        data.data?.total ??
        (Array.isArray(paymentsArray) ? paymentsArray.length : 0);

      const startIndex = (page - 1) * limit;
      const formatted = (paymentsArray || []).map(
        (item: any, index: number) => ({
          ...item,
          id: item._id ?? item.id,
          sn: startIndex + index + 1,
        })
      );

      setPayments(formatted);
      setRowCount(Number(total) || 0);
    } catch (e) {
      console.error("[DesignPayments] Fetch error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, isValid, debouncedSearchText, sortModel]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    {
      field: "_id",
      headerName: "ID",
      flex: 0.5,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
          <a href={`/admin/design-payments/${params.row._id || params.row.id}`}>
            {params.row._id || params.row.id}
          </a>
        </Typography>
      ),
    },
    { field: "amount", headerName: "Amount", flex: 0.3 },
    { field: "orderId", headerName: "Order ID", flex: 0.5 },
    { field: "paymentId", headerName: "Payment ID", flex: 0.5 },
    {
      field: "customerName",
      headerName: "Customer",
      flex: 0.5,
      renderCell: (params) => params.row.customer?.fullName || "N/A",
    },
    {
      field: "projectName",
      headerName: "Project",
      flex: 0.5,
      renderCell: (params) =>
        params.row.project?.name && params.row.project.name !== ""
          ? params.row.project.name
          : "Unknown Project",
    },
    { field: "createdAt", headerName: "Created At", flex: 0.6 },
  ];

  return (
    <>
      <Navbar label="Design Payments" />
      <Box sx={{ p: 3 }}>
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mb: 2,
            alignItems: "center",
          }}
        >
          <FormControl sx={{ minWidth: 150 }} required>
            <InputLabel id="isValid-label">Validity</InputLabel>
            <Select
              labelId="isValid-label"
              label="Validity"
              value={isValid}
              onChange={(e) => setIsValid(e.target.value)}
            >
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Search (Name, Email, IDs, etc)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, email, order ID, payment ID, customer/project ID"
            sx={{ minWidth: 400 }}
          />
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
              rows={payments}
              columns={columns}
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              paginationMode="server"
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              autoHeight
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default DesignPayments;
