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
  Cancel as CancelIcon,
  PlayArrow as StartIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import dayjs from "dayjs";
import Navbar from "@/app/components/navbar/navbar";

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
    if (lowercaseStatus?.includes("complete")) return "success";
    if (lowercaseStatus?.includes("progress") || lowercaseStatus?.includes("active")) return "primary";
    if (lowercaseStatus?.includes("pending") || lowercaseStatus?.includes("wait")) return "warning";
    if (lowercaseStatus?.includes("cancel") || lowercaseStatus?.includes("error")) return "error";
    return "default";
  };

  return <Chip label={status} color={getStatusColor(status)} size="small" sx={{ fontWeight: 600 }} />;
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
    { value: "pending", label: "Pending", color: "warning", icon: <PendingIcon /> },
    { value: "completed", label: "Completed", color: "success", icon: <CheckIcon /> },
    { value: "cancelled", label: "Cancelled", color: "error", icon: <CancelIcon /> },
  ];

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={
            currentStatus?.toLowerCase() === option.value ? "contained" : "outlined"
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
  type = "expected",
}: {
  startDate: string;
  endDate: string;
  type?: "expected" | "actual";
}) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: type === "expected" ? "info.light" : "success.light",
      color: type === "expected" ? "info.contrastText" : "success.contrastText",
    }}
  >
    <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
      {type === "expected" ? "Expected" : "Actual"}
    </Typography>
    <Typography variant="body2">
      {dayjs(startDate).format("DD MMM YYYY")} →{" "}
      {dayjs(endDate).format("DD MMM YYYY")}
    </Typography>
  </Box>
);

type WorkTask = {
  workTaskId: string;
  workTaskName: string;
  status: string;
  notes?: string;
  actualStartDate?: string;
  actualEndDate?: string;
};

type WorkGroup = {
  workGroupName: string;
  workGroupId: string;
  status: string;
  notes?: string;
  workTasks: WorkTask[];
};

type POScheduleItem = {
  workTaskName: string;
  status: string;
  expectedPODate: string;
  actualPODate: string;
  notes?: string;
};

type MatchedProduct = {
  productName: string;
  coohomId: string;
  obsBrandGoodId: string;
  workGroupName: string;
  workTaskName: string;
};

type UnmatchedItem = {
  obsBrandGoodId: string;
  reason: string;
};

type WorksSnapshot = {
  worksId: string;
  worksName: string;
  capturedAt: string | null;
};

const WorkOrderDetailsPage = () => {
  const theme = useTheme();
  const { token } = useTokenAndRole();
  const { id: workOrderId } = useParams();

  const [workOrder, setWorkOrder] = useState<any>(null);
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

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const updateWorkGroupStatus = async (workGroupId: string, newStatus: string) => {
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
        throw new Error(`Failed to update work group status: ${await response.text()}`);
      }

      // Update local state
      setWorkOrder((prev: any) => ({
        ...prev,
        executionPlan: prev.executionPlan.map((group: WorkGroup) =>
          group.workGroupId === workGroupId
            ? { ...group, status: newStatus }
            : group
        ),
      }));

      showSnackbar(`Work group status updated to ${newStatus}`, "success");
    } catch (error: any) {
      console.error("Error updating work group status:", error);
      showSnackbar(`Error updating work group status: ${error.message}`, "error");
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
        throw new Error(`Failed to update work task status: ${await response.text()}`);
      }

      // Update local state
      setWorkOrder((prev: any) => ({
        ...prev,
        executionPlan: prev.executionPlan.map((group: WorkGroup) =>
          group.workGroupId === workGroupId
            ? {
                ...group,
                workTasks: group.workTasks.map((task: WorkTask) =>
                  task.workTaskId === workTaskId
                    ? { ...task, status: newStatus }
                    : task
                ),
              }
            : group
        ),
      }));

      showSnackbar(`Work task status updated to ${newStatus}`, "success");
    } catch (error: any) {
      console.error("Error updating work task status:", error);
      showSnackbar(`Error updating work task status: ${error.message}`, "error");
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

  useEffect(() => {
    if (!workOrderId || !token) return;

    const fetchWorkOrder = async () => {
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

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        // Group execution plan
        const structuredExecutionPlan: any[] = [];
        let currentGroup: any = null;

        for (const step of data.executionPlan || []) {
          if (step.type === "workGroup") {
            if (currentGroup) structuredExecutionPlan.push(currentGroup);
            currentGroup = {
              workGroupName: step.name || "—",
              workGroupId: step.id || "—",
              status: step.status || "active",
              notes: step.notes || "",
              workTasks: [],
            };
          } else if (step.type === "workTask") {
            const task = {
              workTaskId: step.id || "—",
              workTaskName: step.name || "—",
              status: step.status || "pending",
              notes: step.notes || "",
              actualStartDate: step.startDate || data.startDate,
              actualEndDate: step.endDate || data.estimatedCompletionDate,
            };

            if (currentGroup) currentGroup.workTasks.push(task);
          }
        }
        if (currentGroup) structuredExecutionPlan.push(currentGroup);

        setWorkOrder({
          _id: data._id || "—",
          workOrderId: data.workOrderId || "—",
          designOrderId: data.designOrderId || "—",
          customerId: data.customerId || "—",
          customerEmail: data.customerEmail || "—",
          currentPhase: data.currentPhase || "—",
          status: data.status || "—",
          overallStatus: data.status || "—",
          overallProgress: data.overallProgress ?? 0,
          isArchived: data.isArchived ?? false,
          expectedStartDate: data.startDate || null,
          expectedCompletionDate: data.estimatedCompletionDate || null,
          actualStartDate: data.startDate || null,
          actualCompletionDate: data.estimatedCompletionDate || null,
          executionPlan: structuredExecutionPlan,
          poSchedule: data.poSchedule || [],
          matchedProducts: data.matchedProducts || [],
          unmatchedItems: data.unmatchedItems || [],
          worksSnapshot: {
            worksId: data.worksSnapshot?.worksId || "—",
            worksName: data.worksSnapshot?.worksName || "—",
            capturedAt: data.worksSnapshot?.capturedAt || null,
          },
          projectId: data.worksSnapshot?.worksId || "—",
          projectName: data.worksSnapshot?.worksName || "—",
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [workOrderId, token]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!workOrder) return null;

  return (
    <>
      <Navbar label="Update Work Orders" />
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
              Work Order: {workOrder?.workOrderId || "—"}
            </Typography>
            <StatusChip status={workOrder?.overallStatus || "—"} />
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Project Information"
                  sx={{ pb: 1 }}
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <LabelValue
                    label="Design Order ID"
                    value={workOrder?.designOrderId || "—"}
                    icon={<TaskIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Customer Email"
                    value={workOrder?.customerEmail || "—"}
                    icon={<ErrorIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Customer ID"
                    value={workOrder?.customerId || "—"}
                    icon={<PersonIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Project Name"
                    value={workOrder?.projectName || "—"}
                    icon={<ProductIcon fontSize="small" color="primary" />}
                  />
                  <LabelValue
                    label="Project ID"
                    value={workOrder?.projectId || "—"}
                    icon={<WorkOutlineIcon fontSize="small" color="primary" />}
                  />
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
                      startDate={workOrder?.expectedStartDate || null}
                      endDate={workOrder?.expectedCompletionDate || null}
                      type="expected"
                    />
                    <DateRange
                      startDate={workOrder?.actualStartDate || null}
                      endDate={workOrder?.actualCompletionDate || null}
                      type="actual"
                    />
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
                <Badge
                  badgeContent={workOrder?.executionPlan?.length || 0}
                  color="primary"
                />
              </Stack>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            {workOrder.executionPlan.map((group: any, i: number) => (
              <Accordion key={i} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ width: "100%" }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {group?.workGroupName || `Work Group ${i + 1}`}
                    </Typography>
                    <StatusChip status={group?.status || "—"} />
                    {updating === `group-${group.workGroupId}` && (
                      <CircularProgress size={16} />
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  {group?.notes && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {group.notes}
                    </Alert>
                  )}

                  {/* Work Group Status Buttons */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Update Work Group Status:
                    </Typography>
                    <StatusUpdateButtons
                      currentStatus={group.status}
                      onChange={(newStatus) =>
                        handleStatusChange("group", group.workGroupId, newStatus)
                      }
                      disabled={updating === `group-${group.workGroupId}`}
                    />
                  </Box>

                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Work Tasks ({group?.workTasks?.length || 0})
                  </Typography>
                  <Grid container spacing={2}>
                    {group?.workTasks?.map((task: any, j: number) => (
                      <Grid item xs={12} key={j}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {task?.workTaskName || `Task ${j + 1}`}
                                </Typography>
                                <StatusChip status={task?.status || "—"} />
                                <Typography variant="body2" color="text.secondary">
                                  {task?.actualStartDate
                                    ? dayjs(task.actualStartDate).format("DD MMM")
                                    : "—"}{" "}
                                  →{" "}
                                  {task?.actualEndDate
                                    ? dayjs(task.actualEndDate).format("DD MMM")
                                    : "—"}
                                </Typography>
                                {task?.notes && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {task.notes}
                                  </Typography>
                                )}
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600, display: "block", mb: 1 }}
                                >
                                  Update Task Status:
                                </Typography>
                                <StatusUpdateButtons
                                  currentStatus={task.status}
                                  onChange={(newStatus) =>
                                    handleStatusChange(
                                      "task",
                                      group.workGroupId,
                                      newStatus,
                                      task.workTaskId
                                    )
                                  }
                                  disabled={updating === `task-${task.workTaskId}`}
                                />
                                {updating === `task-${task.workTaskId}` && (
                                  <Box
                                    sx={{ mt: 1, display: "flex", alignItems: "center" }}
                                  >
                                    <CircularProgress size={16} sx={{ mr: 1 }} />
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
            ))}
          </CardContent>
        </Card>

        {/* PO Schedule */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  PO Schedule
                </Typography>
                <Badge
                  badgeContent={workOrder.poSchedule?.length || 0}
                  color="primary"
                />
              </Stack>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              {workOrder.poSchedule?.map((po: POScheduleItem, i: number) => (
                <Grid item xs={12} md={6} key={i}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {po.workTaskName}
                      </Typography>
                      <StatusChip status={po.status} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Expected: {dayjs(po.expectedPODate).format("DD MMM")}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Actual: {dayjs(po.actualPODate).format("DD MMM")}
                        </Typography>
                      </Box>
                      {po.notes && (
                        <Typography variant="caption" color="text.secondary">
                          {po.notes}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Matched Products */}
          <Grid item xs={12} lg={6}>
            <Accordion sx={{ borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckIcon color="success" />
                  <Typography variant="h6" fontWeight={600}>
                    Matched Products
                  </Typography>
                  <Badge
                    badgeContent={workOrder.matchedProducts?.length || 0}
                    color="success"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 400, overflow: "auto" }}>
                <Stack spacing={2}>
                  {workOrder.matchedProducts?.map(
                    (prod: MatchedProduct, i: number) => (
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Coohom ID: {prod.coohomId}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              OBS ID: {prod.obsBrandGoodId}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Group: {prod.workGroupName}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Task: {prod.workTaskName}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    )
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Unmatched Items */}
          <Grid item xs={12} lg={6}>
            <Accordion sx={{ borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ErrorIcon color="error" />
                  <Typography variant="h6" fontWeight={600}>
                    Unmatched Items
                  </Typography>
                  <Badge
                    badgeContent={workOrder.unmatchedItems?.length || 0}
                    color="error"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 400, overflow: "auto" }}>
                <Stack spacing={2}>
                  {workOrder.unmatchedItems?.map(
                    (item: UnmatchedItem, i: number) => (
                      <Alert
                        key={i}
                        severity="warning"
                        sx={{ borderRadius: 1 }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          OBS ID: {item.obsBrandGoodId}
                        </Typography>
                        <Typography variant="caption">
                          Reason: {item.reason}
                        </Typography>
                      </Alert>
                    )
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        {/* Works Snapshot */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight={600}>
                Works Snapshot
              </Typography>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <LabelValue
                  label="Works Name"
                  value={workOrder?.worksSnapshot?.worksName || "—"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LabelValue
                  label="Captured At"
                  value={
                    workOrder?.worksSnapshot?.capturedAt
                      ? dayjs(workOrder.worksSnapshot.capturedAt).format(
                          "DD MMM YYYY HH:mm"
                        )
                      : "—"
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Footer */}
        <Paper sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created:{" "}
            {workOrder?.createdAt
              ? dayjs(workOrder.createdAt).format("DD MMM YYYY HH:mm")
              : "—"}{" "}
            • Last Updated:{" "}
            {workOrder?.updatedAt
              ? dayjs(workOrder.updatedAt).format("DD MMM YYYY HH:mm")
              : "—"}
          </Typography>
        </Paper>
      </Container>
</>
  );
};

export default WorkOrderDetailsPage;