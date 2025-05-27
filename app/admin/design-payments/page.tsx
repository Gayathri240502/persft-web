"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

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
    pageSize: 5,
  });
  const [rowCount, setRowCount] = useState(0);

  // Filters
  const [isValid, setIsValid] = useState<string>("true"); // default "true"
  const [searchText, setSearchText] = useState("");

  const debouncedSearchText = useDebounce(searchText, 500); // 500ms debounce

  const { token } = getTokenAndRole();

  const fetchPayments = async () => {
    if (isValid === "") {
      setError("Please select validity status before searching.");
      return;
    }

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
      params.append("sortField", sortField);
      params.append("sortOrder", sortOrder);
      params.append("isValid", isValid);

      if (debouncedSearchText.trim()) {
        params.append("customerId", debouncedSearchText.trim());
        params.append("projectId", debouncedSearchText.trim());
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/design-payments?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch design payments");

      const data = await res.json();

      const startIndex = (page - 1) * limit;
      const formatted = data.payments.map(
        (item: DesignPayment, index: number) => ({
          ...item,
          id: item._id,
          sn: startIndex + index + 1,
        })
      );

      setPayments(formatted);
      setRowCount(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and whenever paginationModel, isValid, or debouncedSearchText changes
  useEffect(() => {
    fetchPayments();
  }, [paginationModel, isValid, debouncedSearchText]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    {
      field: "_id",
      headerName: "ID",
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
          <a href={`/admin/design-payments/${params.row._id}`}>
            {params.row._id}
          </a>
        </Typography>
      ),
    },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "orderId", headerName: "Order ID", flex: 1 },
    { field: "paymentId", headerName: "Payment ID", flex: 1 },
    {
      field: "customerName",
      headerName: "Customer",
      flex: 1,
      renderCell: (params) => params.row.customer?.fullName || "N/A",
    },
    {
      field: "projectName",
      headerName: "Project",
      flex: 1,
      renderCell: (params) =>
        params.row.project?.name && params.row.project.name !== ""
          ? params.row.project.name
          : "Unknown Project",
    },
    // { field: "validUntil", headerName: "Valid Until", flex: 1 },
    // { field: "createdAt", headerName: "Created At", flex: 1 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Design Payments
      </Typography>

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
          label="Search Customer or Project ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by Customer ID or Project ID"
          sx={{ minWidth: 300 }}
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
        <StyledDataGrid
          // minWidth={1500}
          rows={payments}
          columns={columns}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          autoHeight
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
};

export default DesignPayments;
