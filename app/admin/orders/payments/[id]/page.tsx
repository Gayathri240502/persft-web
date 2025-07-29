"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Container,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import {
  BadgeCheck,
  TimerReset,
  CreditCard,
  Calendar,
  DollarSign,
  Percent,
  Receipt,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

// Enhanced interface with better type safety
interface PaymentStage {
  stage: string;
  percentage: number;
  amount: number;
  status: "completed" | "pending" | "failed" | "processing";
  paymentId: string;
  paymentOrderId: string;
  paymentTimestamp: string;
  razorpayOrderId?: string;
  description?: string;
  transactionFee?: number;
}

// Enhanced API response interface
interface PaymentsApiResponse {
  success: boolean;
  message?: string;
  data?:
    | {
        paymentStages?: PaymentStage[];
        totalAmount?: number;
        completedAmount?: number;
        pendingAmount?: number;
      }
    | PaymentStage[];
  paymentStages?: PaymentStage[];
  payments?: PaymentStage[];
}

const PaymentsPage = () => {
  const { id: orderId } = useParams();
  const { token } = useTokenAndRole();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [payments, setPayments] = useState<PaymentStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    completedCount: 0,
    pendingCount: 0,
  });

  // Enhanced data extraction function
  const extractPaymentData = (apiResponse: any): PaymentStage[] => {
    // Handle different possible response structures
    if (!apiResponse) return [];

    // Direct array
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }

    // Nested in data object
    if (apiResponse.data) {
      if (Array.isArray(apiResponse.data)) {
        return apiResponse.data;
      }
      if (
        apiResponse.data.paymentStages &&
        Array.isArray(apiResponse.data.paymentStages)
      ) {
        return apiResponse.data.paymentStages;
      }
      if (
        apiResponse.data.payments &&
        Array.isArray(apiResponse.data.payments)
      ) {
        return apiResponse.data.payments;
      }
    }

    // Direct paymentStages property
    if (apiResponse.paymentStages && Array.isArray(apiResponse.paymentStages)) {
      return apiResponse.paymentStages;
    }

    // Direct payments property
    if (apiResponse.payments && Array.isArray(apiResponse.payments)) {
      return apiResponse.payments;
    }

    // Nested deeper
    if (
      apiResponse.result?.paymentStages &&
      Array.isArray(apiResponse.result.paymentStages)
    ) {
      return apiResponse.result.paymentStages;
    }

    return [];
  };

  // Calculate summary statistics
  const calculateSummary = (paymentData: PaymentStage[]) => {
    const totalAmount = paymentData.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const completedPayments = paymentData.filter(
      (p) => p.status === "completed"
    );
    const pendingPayments = paymentData.filter((p) => p.status === "pending");

    const completedAmount = completedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const pendingAmount = pendingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    setSummary({
      totalAmount,
      completedAmount,
      pendingAmount,
      completedCount: completedPayments.length,
      pendingCount: pendingPayments.length,
    });
  };

  const fetchPayments = async () => {
    if (!orderId || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders/${orderId}/payments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to fetch payments`
        );
      }

      const data: PaymentsApiResponse = await response.json();
      const extractedPayments = extractPaymentData(data);

      setPayments(extractedPayments);
      calculateSummary(extractedPayments);
      setRetryCount(0);
    } catch (err: any) {
      console.error("Payment fetch error:", err);
      setError(err.message || "Unknown error occurred");
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [orderId, token]);

  // Retry handler
  const handleRetry = () => {
    fetchPayments();
  };

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "success" as const,
          icon: <CheckCircle2 size={18} />,
          bgColor: "#e8f5e8",
          textColor: "#2e7d32",
        };
      case "pending":
        return {
          color: "warning" as const,
          icon: <Clock size={18} />,
          bgColor: "#fff3e0",
          textColor: "#f57c00",
        };
      case "processing":
        return {
          color: "info" as const,
          icon: <RefreshCw size={18} />,
          bgColor: "#e3f2fd",
          textColor: "#1976d2",
        };
      case "failed":
        return {
          color: "error" as const,
          icon: <AlertCircle size={18} />,
          bgColor: "#ffebee",
          textColor: "#d32f2f",
        };
      default:
        return {
          color: "default" as const,
          icon: <TimerReset size={18} />,
          bgColor: "#f5f5f5",
          textColor: "#757575",
        };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card className="rounded-2xl">
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton
                variant="rectangular"
                width="40%"
                height={24}
                className="mb-2"
              />
              <Divider sx={{ my: 1 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="70%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Summary Cards Component
  const SummaryCards = () => (
    <Grid container spacing={2} className="mb-6">
      <Grid item xs={12} sm={6} md={3}>
        <Paper className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box className="p-2 rounded-full bg-blue-500">
              <DollarSign size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(summary.totalAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box className="p-2 rounded-full bg-green-500">
              <CheckCircle2 size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(summary.completedAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed ({summary.completedCount})
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box className="p-2 rounded-full bg-orange-500">
              <Clock size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(summary.pendingAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending ({summary.pendingCount})
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box className="p-2 rounded-full bg-purple-500">
              <Percent size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {summary.totalAmount > 0
                  ? Math.round(
                      (summary.completedAmount / summary.totalAmount) * 100
                    )
                  : 0}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  // Progress bar
  const ProgressSection = () => {
    const progressPercentage =
      summary.totalAmount > 0
        ? (summary.completedAmount / summary.totalAmount) * 100
        : 0;

    return (
      <Paper className="p-4 rounded-2xl mb-6">
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold">
              Payment Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progressPercentage)}% Complete
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            className="h-2 rounded-full"
            sx={{
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor:
                  progressPercentage === 100 ? "#4caf50" : "#2196f3",
              },
            }}
          />
        </Stack>
      </Paper>
    );
  };

  return (
    <>
      <Navbar label="Design Orders" />
      <Container maxWidth="xl" className="py-6">
        {/* Header */}
        <Stack
          direction={isMobile ? "column" : "row"}
          justifyContent="space-between"
          alignItems={isMobile ? "flex-start" : "center"}
          spacing={2}
          className="mb-6"
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Payment Stages
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Order ID: {orderId}
            </Typography>
          </Box>

          {!loading && (
            <Tooltip title="Refresh payments">
              <IconButton
                onClick={handleRetry}
                className="rounded-full"
                size="large"
              >
                <RefreshCw size={24} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {loading ? (
          <Box>
            <SummaryCards />
            <LoadingSkeleton />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            className="my-4 rounded-2xl"
            action={
              <IconButton
                aria-label="retry"
                color="inherit"
                size="small"
                onClick={handleRetry}
              >
                <RefreshCw />
              </IconButton>
            }
          >
            <Typography variant="body1" fontWeight="bold">
              Failed to load payments
            </Typography>
            <Typography variant="body2">
              {error}
              {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
            </Typography>
          </Alert>
        ) : payments.length === 0 ? (
          <Paper className="p-8 rounded-2xl text-center">
            <CreditCard size={64} className="mx-auto mb-4 text-gray-400" />
            <Typography variant="h6" gutterBottom>
              No payments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no payment stages available for this order.
            </Typography>
          </Paper>
        ) : (
          <>
            <SummaryCards />
            <ProgressSection />

            {/* Payment Cards */}
            <Grid container spacing={3}>
              {payments.map((payment, index) => {
                const statusConfig = getStatusConfig(payment.status);

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    key={`${payment.paymentId}-${index}`}
                  >
                    <Card
                      className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      sx={{
                        border: `2px solid ${statusConfig.bgColor}`,
                        background: `linear-gradient(135deg, ${statusConfig.bgColor}10 0%, transparent 50%)`,
                      }}
                    >
                      <CardContent className="p-6">
                        {/* Header */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          className="mb-4"
                        >
                          <Typography
                            variant="h6"
                            className="capitalize font-bold"
                          >
                            {payment.stage}
                          </Typography>
                          <Chip
                            label={payment.status.toUpperCase()}
                            color={statusConfig.color}
                            icon={statusConfig.icon}
                            size="small"
                            className="font-semibold"
                          />
                        </Stack>

                        <Divider className="mb-4" />

                        {/* Payment Details */}
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <DollarSign
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Amount
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {formatCurrency(payment.amount)}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Percent
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Percentage
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {payment.percentage}%
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Calendar
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Payment Date
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {formatDate(payment.paymentTimestamp)}
                              </Typography>
                            </Box>
                          </Stack>

                          {payment.razorpayOrderId && (
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              <Receipt
                                size={20}
                                color={theme.palette.text.secondary}
                              />
                              <Box className="min-w-0 flex-1">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Razorpay Order ID
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  className="truncate"
                                  title={payment.razorpayOrderId}
                                >
                                  {payment.razorpayOrderId}
                                </Typography>
                              </Box>
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default PaymentsPage;
