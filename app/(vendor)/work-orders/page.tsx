"use client";

import React, { useState, useCallback, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  useMediaQuery,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility as ViewIcon } from "@mui/icons-material";

import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface WorkOrder {
  workOrderId: string;
  status: string;
  expectedStartDate: string;
  expectedCompletionDate: string;
  totalAssignedProducts: number;
  createdAt: string;
  id?: string;
  sn?: number;
}

// debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const WorkOrders = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useTokenAndRole();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkOrders = async () => {
    const { page, pageSize } = paginationModel;
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });
      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/work-orders?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch work orders.");

      const data = await res.json();

      if (Array.isArray(data.workOrders)) {
        const mapped = data.workOrders.map((wo: WorkOrder, idx: number) => ({
          ...wo,
          id: wo.workOrderId,
          sn: page * pageSize + idx + 1,
        }));
        setWorkOrders(mapped);
        setRowCount(data.total || 0);
      } else {
        setWorkOrders([]);
        setRowCount(0);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setWorkOrders([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [paginationModel, debouncedSearch]);

  const handleSearchChange = useCallback((val: string) => setSearch(val), []);

  const handleViewWorkOrder = (workOrderId: string) => {
    router.push(`/work-orders/${workOrderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "completed":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";
  };

  const Columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 50 },
    { field: "workOrderId", headerName: "Work Order ID", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value || "-"}
          color={getStatusColor(params.value || "")}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "expectedStartDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "expectedCompletionDate",
      headerName: "Completion Date",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "totalAssignedProducts",
      headerName: "Products",
      flex: 0.6,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      align: "center",
      headerAlign: "center",
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleViewWorkOrder(params.row.workOrderId)}
          title="View Work Order"
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Navbar label="Work Orders" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ height: 600, width: "100%", position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <StyledDataGrid
            columns={Columns}
            rows={workOrders}
            rowCount={rowCount}
            pagination
            disableAllSorting
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            getRowId={(row) => row.id || row.workOrderId}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>
      </Box>
    </>
  );
};

export default WorkOrders;
