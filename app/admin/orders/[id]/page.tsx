"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Container,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircleOutline,
  HourglassEmpty,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import dayjs from "dayjs";

interface PaymentConfiguration {
  bookingPercentage: number;
  processingPercentage: number;
  preDeliveryPercentage: number;
  completionPercentage: number;
}

interface PaymentStage {
  stage: string;
  percentage: number;
  amount: number;
  status: "completed" | "pending" | "failed";
  attempts: number;
  paymentOrderId?: string;
  lastAttemptAt?: string;
  paymentId?: string;
  completedAt?: string;
}

interface OrderItem {
  styleItemName: string;
  brandGoodName: string;
  obsBrandGoodId: string;
  sku: string;
  quantity: number;
  price: number;
  currency: string;
}

interface DesignOrder {
  orderId: string;
  customerId: string;
  customerEmail: string;
  projectId: string;
  status: string;
  designId: string;
  designLink: string;
  clewId: string;
  prototypeRoomId: string;
  designData: object;
  orderItems: OrderItem[];
  totalAmount: number;
  totalPaidAmount: number;
  currentPaymentStage: string;
  paymentStages: PaymentStage[];
  paymentConfiguration: PaymentConfiguration;
  lastPaymentAttemptAt: string;
  totalPaymentAttempts: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// A reusable component to display a label-value pair with an icon
const LabelValue = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
      {icon}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography variant="body1" sx={{ pl: icon ? 3 : 0 }}>
      {value || "—"}
    </Typography>
  </Box>
);

// A reusable component for status chips
const getStatusChip = (status: string) => {
  const lowercaseStatus = status?.toLowerCase();
  switch (lowercaseStatus) {
    case "completed":
    case "completion":
      return (
        <Chip
          label="Completed"
          color="success"
          icon={<CheckCircleOutline />}
          size="small"
        />
      );
    case "pending":
    case "processing":
    case "booking":
    case "pre_delivery":
      return (
        <Chip
          label={lowercaseStatus.replace(/_/g, " ")}
          color="warning"
          icon={<HourglassEmpty />}
          size="small"
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

const DesignOrderDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [order, setOrder] = useState<DesignOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch design order");
        }

        const data: DesignOrder = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No design order found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Design Order Details" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Order ID: {order.orderId}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {/* FIX: Use component="div" to avoid nesting block-level elements */}
                <Typography variant="body1" component="div">
                  <Chip
                    label={order.status.replace(/_/g, " ")}
                    color="primary"
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                </Typography>
                {order.isArchived && (
                  <Chip label="Archived" color="default" size="small" />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push("/admin/orders")}
                variant="outlined"
              >
                Back to Orders
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {/* Customer & Order Details Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardHeader
                title="Customer & Project Details"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={<PersonIcon color="primary" />}
              />

              <CardContent>
                <LabelValue
                  label="Customer ID"
                  value={order.customerId}
                  icon={<PersonIcon fontSize="small" color="primary" />}
                />
                <LabelValue
                  label="Customer Email"
                  value={order.customerEmail}
                  icon={<EmailIcon fontSize="small" color="primary" />}
                />
                <LabelValue
                  label="Project ID"
                  value={order.projectId}
                  icon={<BusinessIcon fontSize="small" color="primary" />}
                />
                <LabelValue
                  label="Design Link"
                  value={
                    <a
                      href={order.designLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2", textDecoration: "underline" }}
                    >
                      View Design
                    </a>
                  }
                  icon={<LinkIcon fontSize="small" color="primary" />}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Summary Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardHeader
                title="Financial Summary"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={<MoneyIcon color="primary" />}
              />
              <CardContent>
                <LabelValue
                  label="Total Amount"
                  value={`₹${order.totalAmount.toFixed(2)}`}
                  icon={<MoneyIcon fontSize="small" color="primary" />}
                />
                <LabelValue
                  label="Total Paid Amount"
                  value={`₹${order.totalPaidAmount.toFixed(2)}`}
                  icon={<MoneyIcon fontSize="small" color="primary" />}
                />
                <LabelValue
                  label="Total Payment Attempts"
                  value={order.totalPaymentAttempts}
                  icon={<PaymentIcon fontSize="small" color="primary" />}
                />
                <LabelValue
                  label="Last Payment Attempt At"
                  value={
                    order.lastPaymentAttemptAt
                      ? dayjs(order.lastPaymentAttemptAt).format(
                          "DD MMM YYYY HH:mm"
                        )
                      : "N/A"
                  }
                  icon={<CalendarIcon fontSize="small" color="primary" />}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items Card */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Order Items"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={<ShoppingCartIcon color="primary" />}
              />
              <CardContent sx={{ maxHeight: 400, overflowY: "auto" }}>
                <List disablePadding>
                  {order.orderItems.map((item, index) => (
                    <ListItem
                      key={index}
                      divider={index < order.orderItems.length - 1}
                    >
                      <ListItemText
                        primary={
                          <Typography fontWeight="bold">
                            {item.brandGoodName} ({item.styleItemName})
                          </Typography>
                        }
                        secondary={`SKU: ${item.sku || "N/A"} | Quantity: ${item.quantity} | Price: ₹${item.price.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Stages Card */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Payment Stages"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={<PaymentIcon color="primary" />}
              />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Amount (₹)</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Completed At</TableCell>
                        <TableCell>Payment ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.paymentStages.map((stage) => (
                        <TableRow
                          key={stage.stage}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            backgroundColor:
                              stage.stage === order.currentPaymentStage
                                ? "action.hover"
                                : "inherit",
                          }}
                        >
                          <TableCell sx={{ textTransform: "capitalize" }}>
                            {stage.stage.replace(/_/g, " ")}
                            {stage.stage === order.currentPaymentStage && (
                              <Chip
                                label="Current"
                                size="small"
                                color="primary"
                                sx={{ ml: 1, height: 20 }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {stage.percentage}%
                          </TableCell>
                          <TableCell align="right">
                            {stage.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusChip(stage.status)}</TableCell>
                          <TableCell>
                            {stage.completedAt
                              ? dayjs(stage.completedAt).format(
                                  "DD MMM YYYY HH:mm"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>{stage.paymentId || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: "grey.50", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Created: {dayjs(order.createdAt).format("DD MMM YYYY HH:mm")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
              <Typography variant="caption" color="text.secondary">
                Last Updated:{" "}
                {dayjs(order.updatedAt).format("DD MMM YYYY HH:mm")}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default DesignOrderDetailsPage;
