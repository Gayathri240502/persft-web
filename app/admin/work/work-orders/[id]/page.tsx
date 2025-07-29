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
    if (
      lowercaseStatus?.includes("progress") ||
      lowercaseStatus?.includes("active")
    )
      return "primary";
    if (
      lowercaseStatus?.includes("pending") ||
      lowercaseStatus?.includes("wait")
    )
      return "warning";
    if (
      lowercaseStatus?.includes("cancel") ||
      lowercaseStatus?.includes("error")
    )
      return "error";
    return "default";
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      sx={{ fontWeight: 600 }}
    />
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

const WorkOrderDetailsPage = () => {
  const theme = useTheme();
  const { token } = useTokenAndRole();
  const { id: workOrderId } = useParams();

  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            {workOrder?.executionPlan?.map((group, i) => (
              <Accordion key={i} sx={{ mb: 1, "&:last-child": { mb: 0 } }}>
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
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  {group?.notes && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {group.notes}
                    </Alert>
                  )}

                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Work Tasks ({group?.workTasks?.length || 0})
                  </Typography>

                  <Grid container spacing={2}>
                    {group?.workTasks?.map((task, j) => (
                      <Grid item xs={12} md={6} key={j}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                        >
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
              {workOrder.poSchedule?.map((po, i) => (
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
                  {workOrder.matchedProducts?.map((prod, i) => (
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
                            OBS ID: {prod.obsBrandGoodId}
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
                      </Grid>
                    </Paper>
                  ))}
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
                  {workOrder.unmatchedItems?.map((item, i) => (
                    <Alert key={i} severity="warning" sx={{ borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        OBS ID: {item.obsBrandGoodId}
                      </Typography>
                      <Typography variant="caption">
                        Reason: {item.reason}
                      </Typography>
                    </Alert>
                  ))}
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
