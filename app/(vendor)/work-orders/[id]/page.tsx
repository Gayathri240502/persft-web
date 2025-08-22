"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Grid,
  Divider,
  Button,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import {
  GetApp as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Product {
  productId: string;
  productName: string;
  obsBrandGoodId: string;
  coohomId: string;
  workGroupName: string;
  workTaskName: string;
  targetDays: number;
  bufferDays: number;
  poDays: number;
  assignedAt: string;
  assignedByName: string;
  poStatus: string;
  poAvailable: boolean;
}

interface WorkOrderDetail {
  workOrderId: string;
  status: string;
  expectedStartDate: string;
  expectedCompletionDate: string;
  assignedProducts: Product[];
  totalAssignedProducts: number;
  createdAt: string;
}

const WorkOrderDetail = () => {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useTokenAndRole();

  const workOrderId = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkOrderDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/work-orders/${workOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch work order details.");

      const data = await res.json();
      setWorkOrder(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderDetail();
    }
  }, [workOrderId]);

  const handleDownloadPO = async (productId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/po/${productId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to download PO");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO_${productId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Download failed.");
    }
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const productsWithId =
    workOrder?.assignedProducts?.map((product, index) => ({
      ...product,
      id: product.productId,
      sn: index + 1,
    })) || [];

  const Columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 50 },
    { field: "productName", headerName: "Product Name", flex: 1 },
    { field: "obsBrandGoodId", headerName: "OBS ID", flex: 1 },
    { field: "workGroupName", headerName: "Work Group", flex: 1 },
    { field: "workTaskName", headerName: "Work Task", flex: 1 },
    { field: "targetDays", headerName: "Target Days", flex: 0.5 },
    { field: "bufferDays", headerName: "Buffer Days", flex: 0.5 },
    { field: "poDays", headerName: "PO Days", flex: 0.5 },
    { field: "poStatus", headerName: "PO Status", flex: 1 },
    {
      field: "poAvailable",
      headerName: "PO Available",
      flex: 1,
      renderCell: (params) =>
        params.row.poAvailable && params.row.poStatus === "generated" ? (
          <IconButton
            size="small"
            onClick={() => handleDownloadPO(params.row.productId)}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        ) : (
          "No"
        ),
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar label="Work Order Details" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar label="Work Order Details" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
            size="small"
          >
            Back to Work Orders
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {workOrder && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                      {workOrder.workOrderId}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={workOrder.status}
                        color={getStatusColor(workOrder.status)}
                        size="medium"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Total Assigned Products
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {workOrder.totalAssignedProducts}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Expected Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDateOnly(workOrder.expectedStartDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Expected Completion Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDateOnly(workOrder.expectedCompletionDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(workOrder.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assigned Products
                </Typography>
                <Box sx={{ height: 600, width: "100%" }}>
                  <StyledDataGrid
                    columns={Columns}
                    rows={productsWithId}
                    pagination
                    paginationMode="client"
                    pageSizeOptions={[5, 10, 25]}
                    autoHeight
                    disableColumnMenu={isSmallScreen}
                    getRowId={(row) => row.id}
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    disableAllSorting
                  />
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </>
  );
};

export default WorkOrderDetail;
