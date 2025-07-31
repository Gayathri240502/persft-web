"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Assignment as TaskIcon,
  Inventory as ProductIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  WorkOutline as WorkOutlineIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Pending as PendingIcon,
  Cancel,
  PlayArrow as StartIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import dayjs from "dayjs";
import Navbar from "@/app/components/navbar/navbar";

interface ExecutionPlanItem {
  type: "workGroup" | "workTask";
  id: string;
  name: string;
  order: number;
  workGroupName?: string;
  workTaskName?: string;
  parentWorkGroupId?: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  status: string;
  progress: number;
  targetDays?: number;
  bufferDays?: number;
  totalDays?: number;
  poDays?: number;
  scheduledPoDate?: string;
  poStatus?: string;
  applicableProducts?: string[];
  productCount?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  notes?: string;
}

interface UnmatchedItem {
  obsBrandGoodId: string;
  reason: string;
  itemData: {
    styleItemName: string;
    brandGoodName: string;
    obsBrandGoodId: string;
    sku: string;
    quantity: number;
    price: number;
    currency: string;
  };
}

interface MatchedProduct {
  obsBrandGoodId: string;
  coohomId: string;
  productId: string;
  productName: string;
  workGroupId: string;
  workGroupName: string;
  workTaskId: string;
  workTaskName: string;
  targetDays: number;
  bufferDays: number;
  poDays: number;
}

interface WorksSnapshot {
  worksId: string;
  worksName: string;
  capturedAt: string;
}

interface WorkOrder {
  _id: string;
  workOrderId: string;
  designOrderId: string;
  customerId: string;
  status: string;
  currentPhase: string;
  overallProgress: number;
  startDate: string;
  estimatedCompletionDate: string;
  executionPlan: ExecutionPlanItem[];
  unmatchedItems: UnmatchedItem[];
  matchedProducts: MatchedProduct[];
  worksSnapshot: WorksSnapshot;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

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

const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    const lowercaseStatus = status?.toLowerCase();
    if (lowercaseStatus === "completed") return "success";
    if (lowercaseStatus === "active") return "primary";
    if (lowercaseStatus === "pending") return "warning";
    if (lowercaseStatus === "cancelled") return "error";
    return "default";
  };

  const getStatusIcon = (status: string) => {
    const lowercaseStatus = status?.toLowerCase();
    if (lowercaseStatus === "completed")
      return <CheckIcon sx={{ fontSize: 16 }} />;
    if (lowercaseStatus === "active")
      return <StartIcon sx={{ fontSize: 16 }} />;
    if (lowercaseStatus === "pending")
      return <PendingIcon sx={{ fontSize: 16 }} />;
    if (lowercaseStatus === "cancelled")
      return <Cancel sx={{ fontSize: 16 }} />;
    return null;
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      icon={getStatusIcon(status)}
      sx={{ fontWeight: 600 }}
    />
  );
};

const StatusUpdateButtons = ({
  currentStatus,
  onChange,
  disabled = false,
}: {
  currentStatus: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}) => {
  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "warning",
      icon: <PendingIcon />,
    },
    { value: "active", label: "Active", color: "primary", icon: <StartIcon /> },
    {
      value: "completed",
      label: "Completed",
      color: "success",
      icon: <CheckIcon />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "error",
      icon: <Cancel />,
    },
  ];

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={
            currentStatus?.toLowerCase() === option.value
              ? "contained"
              : "outlined"
          }
          color={option.color as any}
          size="small"
          startIcon={option.icon}
          onClick={() => onChange(option.value)}
          disabled={disabled}
          sx={{ minWidth: 100 }}
        >
          {option.label}
        </Button>
      ))}
    </Stack>
  );
};

const DateRange = ({
  startDate,
  endDate,
  type = "scheduled",
}: {
  startDate: string;
  endDate: string;
  type?: "scheduled" | "actual";
}) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: type === "scheduled" ? "info.light" : "success.light",
      color:
        type === "scheduled" ? "info.contrastText" : "success.contrastText",
    }}
  >
    <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
      {type === "scheduled" ? "Scheduled" : "Actual"}
    </Typography>
    <Typography variant="body2">
      {dayjs(startDate).format("DD MMM YYYY")} →{" "}
      {dayjs(endDate).format("DD MMM YYYY")}
    </Typography>
  </Box>
);

const WorkOrderDetailsPage = () => {
  const theme = useTheme();
  const { token } = useTokenAndRole();
  const { id: workOrderId } = useParams();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const updateWorkGroupStatus = async (
    workGroupId: string,
    newStatus: string
  ) => {
    const updateKey = `group-${workGroupId}`;
    setUpdating(updateKey);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}/groups/${workGroupId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update work group status`
        );
      }

      const data = await response.json();
      setWorkOrder(data.workOrder);
      showSnackbar(`Work group status updated to ${newStatus}`, "success");
    } catch (error: any) {
      console.error("Error updating work group status:", error);
      showSnackbar(
        `Error updating work group status: ${error.message}`,
        "error"
      );
    } finally {
      setUpdating(null);
    }
  };

  const updateWorkTaskStatus = async (
    workGroupId: string,
    workTaskId: string,
    newStatus: string
  ) => {
    const updateKey = `task-${workTaskId}`;
    setUpdating(updateKey);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}/groups/${workGroupId}/tasks/${workTaskId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update work task status`
        );
      }

      const data = await response.json();
      setWorkOrder(data.workOrder);
      showSnackbar(`Work task status updated to ${newStatus}`, "success");
    } catch (error: any) {
      console.error("Error updating work task status:", error);
      showSnackbar(
        `Error updating work task status: ${error.message}`,
        "error"
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = (
    type: "group" | "task",
    workGroupId: string,
    newStatus: string,
    workTaskId?: string
  ) => {
    const confirmMessage =
      type === "group"
        ? `Are you sure you want to change the work group status to "${newStatus}"?`
        : `Are you sure you want to change the work task status to "${newStatus}"?`;

    setConfirmDialog({
      open: true,
      title: "Confirm Status Change",
      message: confirmMessage,
      onConfirm: () => {
        if (type === "group") {
          updateWorkGroupStatus(workGroupId, newStatus);
        } else if (workTaskId) {
          updateWorkTaskStatus(workGroupId, workTaskId, newStatus);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const fetchWorkOrder = async () => {
    if (!workOrderId || !token) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setWorkOrder(data);
    } catch (err: any) {
      console.error("Fetch work order error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId, token]);

  if (loading) {
    return (
      <>
        <Navbar label="Work Order Details" />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar label="Work Order Details" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  if (!workOrder) return null;

  // Group execution plan items
  const workGroups = workOrder.executionPlan.filter(
    (item) => item.type === "workGroup"
  );
  const workTasks = workOrder.executionPlan.filter(
    (item) => item.type === "workTask"
  );

  const getTasksForGroup = (groupId: string) => {
    return workTasks.filter((task) => task.parentWorkGroupId === groupId);
  };

  return (
    <>
      <Navbar label="Work Order Details" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Work Order: {workOrder.workOrderId}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip status={workOrder.status} />
              {workOrder.isArchived && (
                <Chip label="Archived" color="default" size="small" />
              )}
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Project Information"
                  sx={{ pb: 1 }}
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                  avatar={<BusinessIcon color="primary" />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <LabelValue
                    label="Design Order ID"
                    value={workOrder.designOrderId}
                    icon={<TaskIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Customer ID"
                    value={workOrder.customerId}
                    icon={<PersonIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Current Phase"
                    value={workOrder.currentPhase}
                    icon={<WorkOutlineIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Works Name"
                    value={workOrder.worksSnapshot.worksName}
                    icon={<ProductIcon fontSize="small" color="primary" />}
                  />
                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 0.5 }}
                    >
                      <ScheduleIcon fontSize="small" color="primary" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Overall Progress
                      </Typography>
                    </Stack>
                    <Box sx={{ pl: 3 }}>
                      <LinearProgress
                        variant="determinate"
                        value={workOrder.overallProgress}
                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                      />
                      <Typography variant="body2">
                        {workOrder.overallProgress}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Timeline"
                  sx={{ pb: 1 }}
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                  avatar={<TimeIcon color="primary" />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Stack spacing={2}>
                    <DateRange
                      startDate={workOrder.startDate}
                      endDate={workOrder.estimatedCompletionDate}
                      type="scheduled"
                    />
                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "grey.100" }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, display: "block" }}
                      >
                        Works Snapshot
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {workOrder.worksSnapshot.worksName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Captured:{" "}
                        {dayjs(workOrder.worksSnapshot.capturedAt).format(
                          "DD MMM YYYY HH:mm"
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Execution Plan */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <TaskIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Execution Plan
                </Typography>
                <Badge badgeContent={workGroups.length} color="primary" />
              </Stack>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            {workGroups.map((group, i) => {
              const groupTasks = getTasksForGroup(group.id);
              return (
                <Accordion key={group.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ width: "100%" }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        {group.name} (Order: {group.order})
                      </Typography>
                      <StatusChip status={group.status} />
                      <Typography variant="caption" color="text.secondary">
                        Progress: {group.progress}%
                      </Typography>
                      {updating === `group-${group.id}` && (
                        <CircularProgress size={16} />
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <DateRange
                          startDate={group.scheduledStartDate}
                          endDate={group.scheduledEndDate}
                          type="scheduled"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {group.actualStartDate && group.actualEndDate && (
                          <DateRange
                            startDate={group.actualStartDate}
                            endDate={group.actualEndDate}
                            type="actual"
                          />
                        )}
                      </Grid>
                    </Grid>

                    {/* Work Group Status Buttons */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Update Work Group Status:
                      </Typography>
                      <StatusUpdateButtons
                        currentStatus={group.status}
                        onChange={(newStatus) =>
                          handleStatusChange("group", group.id, newStatus)
                        }
                        disabled={updating === `group-${group.id}`}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      Work Tasks ({groupTasks.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {groupTasks.map((task) => (
                        <Grid item xs={12} key={task.id}>
                          <Paper
                            variant="outlined"
                            sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                          >
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <Stack spacing={1}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                  >
                                    {task.name} (Order: {task.order})
                                  </Typography>
                                  <StatusChip status={task.status} />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Target: {task.targetDays} days | Buffer:{" "}
                                    {task.bufferDays} days
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    PO Days: {task.poDays} | Products:{" "}
                                    {task.productCount}
                                  </Typography>
                                  {task.poStatus && (
                                    <Chip
                                      label={`PO: ${task.poStatus}`}
                                      size="small"
                                      color={
                                        task.poStatus === "pending"
                                          ? "warning"
                                          : "success"
                                      }
                                    />
                                  )}
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Stack spacing={1}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Scheduled:{" "}
                                    {dayjs(task.scheduledStartDate).format(
                                      "DD MMM"
                                    )}{" "}
                                    →{" "}
                                    {dayjs(task.scheduledEndDate).format(
                                      "DD MMM"
                                    )}
                                  </Typography>
                                  {task.scheduledPoDate && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      PO Date:{" "}
                                      {dayjs(task.scheduledPoDate).format(
                                        "DD MMM YYYY"
                                      )}
                                    </Typography>
                                  )}
                                  {task.applicableProducts &&
                                    task.applicableProducts.length > 0 && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Products:{" "}
                                        {task.applicableProducts.join(", ")}
                                      </Typography>
                                    )}
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 600,
                                      display: "block",
                                      mb: 1,
                                    }}
                                  >
                                    Update Task Status:
                                  </Typography>
                                  <StatusUpdateButtons
                                    currentStatus={task.status}
                                    onChange={(newStatus) =>
                                      handleStatusChange(
                                        "task",
                                        group.id,
                                        newStatus,
                                        task.id
                                      )
                                    }
                                    disabled={updating === `task-${task.id}`}
                                  />
                                  {updating === `task-${task.id}` && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <CircularProgress
                                        size={16}
                                        sx={{ mr: 1 }}
                                      />
                                      <Typography variant="caption">
                                        Updating...
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Matched Products */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckIcon color="success" />
                    <Typography variant="h6" fontWeight={600}>
                      Matched Products
                    </Typography>
                    <Badge
                      badgeContent={workOrder.matchedProducts.length}
                      color="success"
                    />
                  </Stack>
                }
              />
              <CardContent sx={{ maxHeight: 400, overflow: "auto" }}>
                <Stack spacing={2}>
                  {workOrder.matchedProducts.map((prod, i) => (
                    <Paper
                      key={i}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 1 }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                        {prod.productName}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Coohom ID: {prod.coohomId}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Product ID: {prod.productId}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Group: {prod.workGroupName}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Task: {prod.workTaskName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Timeline: {prod.targetDays}d target,{" "}
                            {prod.bufferDays}d buffer, {prod.poDays}d PO
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Unmatched Items */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ErrorIcon color="error" />
                    <Typography variant="h6" fontWeight={600}>
                      Unmatched Items
                    </Typography>
                    <Badge
                      badgeContent={workOrder.unmatchedItems.length}
                      color="error"
                    />
                  </Stack>
                }
              />
              <CardContent sx={{ maxHeight: 400, overflow: "auto" }}>
                <Stack spacing={2}>
                  {workOrder.unmatchedItems.map((item, i) => (
                    <Alert key={i} severity="warning" sx={{ borderRadius: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                      >
                        {item.itemData.brandGoodName}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Type: {item.itemData.styleItemName}
                      </Typography>
                      <Typography variant="caption" display="block">
                        SKU: {item.itemData.sku || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Price: ₹
                        {(item.itemData.price / 100).toLocaleString("en-IN")} x{" "}
                        {item.itemData.quantity}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="error.main"
                      >
                        Reason: {item.reason.replace(/_/g, " ")}
                      </Typography>
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Paper sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Created:{" "}
                {dayjs(workOrder.createdAt).format("DD MMM YYYY HH:mm")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
              <Typography variant="caption" color="text.secondary">
                Last Updated:{" "}
                {dayjs(workOrder.updatedAt).format("DD MMM YYYY HH:mm")}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.onConfirm}
              color="primary"
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default WorkOrderDetailsPage;
