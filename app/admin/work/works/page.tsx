"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// --- Interfaces for type safety ---

interface WorkTask {
  _id?: string;
  id: string;
  name: string;
  order: number;
}

interface WorkGroupWithTasks {
  _id?: string;
  id: string;
  name: string;
  tasks: WorkTask[];
}

interface FormDataWorkGroup {
  workGroup: string;
  order: number;
  workTasks: {
    workTask: string;
    order: number;
  }[];
}

interface WorkData {
  _id?: string;
  name: string;
  description: string;
  workGroups: FormDataWorkGroup[];
}

const WorksManagement = () => {
  const { token } = getTokenAndRole();
  const [work, setWork] = useState<WorkData | null>(null);
  const [workGroupsData, setWorkGroupsData] = useState<WorkGroupWithTasks[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WorkData>({
    name: "",
    description: "",
    workGroups: [],
  });

  // Fetch work data
  const fetchWork = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data: WorkData = await response.json();
        if (data && Object.keys(data).length > 0) {
          setWork(data);
          setFormData({
            name: data.name || "",
            description: data.description || "",
            workGroups: data.workGroups || [],
          });
        } else {
          setWork(null);
          setShowCreateForm(true);
        }
      } else {
        setWork(null);
        setShowCreateForm(true);
      }
    } catch (err) {
      setError("Failed to fetch work data");
      console.error("Error fetching work:", err);
    }
  };

  // Fetch work groups and tasks
  const fetchWorkGroupsAndTasks = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works/work-groups-tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data: WorkGroupWithTasks[] = await response.json();
        setWorkGroupsData(data || []);
      }
    } catch (err) {
      console.error("Error fetching work groups and tasks:", err);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWork(), fetchWorkGroupsAndTasks()]);
      setLoading(false);
    };

    if (token) {
      loadData();
    } else {
      setLoading(false);
      setError("Authentication token not found");
    }
  }, [token]);

  // Helper functions
  const getWorkGroupName = (id: string) => {
    const group = workGroupsData.find((g) => g.id === id);
    return group ? group.name : "Unknown Group";
  };

  const getWorkTaskName = (id: string) => {
    for (const group of workGroupsData) {
      const task = group.tasks.find((t) => t.id === id);
      if (task) {
        return task.name;
      }
    }
    return "Unknown Task";
  };

  const getTasksForWorkGroup = (workGroupId: string) => {
    const group = workGroupsData.find((g) => g.id === workGroupId);
    return group ? group.tasks : [];
  };

  // Handle form input changes
  const handleInputChange = (field: keyof WorkData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add work group to form
  const addWorkGroup = () => {
    setFormData((prev) => {
      const maxOrder =
        prev.workGroups.length > 0
          ? Math.max(...prev.workGroups.map((wg) => wg.order || 0))
          : -1;

      return {
        ...prev,
        workGroups: [
          ...prev.workGroups,
          {
            workGroup: "",
            order: maxOrder + 1,
            workTasks: [],
          },
        ],
      };
    });
  };

  // Remove work group from form
  const removeWorkGroup = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workGroups: prev.workGroups.filter((_, i) => i !== index),
    }));
  };

  // Update work group
  const updateWorkGroup = (
    index: number,
    field: "workGroup" | "order",
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      workGroups: prev.workGroups.map((wg, i) => {
        if (i === index) {
          const updatedWg = { ...wg, [field]: value };
          if (field === "workGroup") {
            updatedWg.workTasks = [];
          }
          if (field === "order") {
            const newOrder =
              typeof value === "string" ? parseInt(value) : value;
            const usedOrders = prev.workGroups
              .filter((_, otherIndex) => otherIndex !== index)
              .map((wg) => wg.order);
            let finalOrder = newOrder;
            while (usedOrders.includes(finalOrder)) {
              finalOrder++;
            }
            updatedWg.order = finalOrder;
          }
          return updatedWg;
        }
        return wg;
      }),
    }));
  };

  // Add task to work group
  const addTaskToWorkGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      workGroups: prev.workGroups.map((wg, i) => {
        if (i === groupIndex) {
          const maxTaskOrder =
            wg.workTasks.length > 0
              ? Math.max(...wg.workTasks.map((wt) => wt.order || 0))
              : -1;

          return {
            ...wg,
            workTasks: [
              ...wg.workTasks,
              {
                workTask: "",
                order: maxTaskOrder + 1,
              },
            ],
          };
        }
        return wg;
      }),
    }));
  };

  // Remove task from work group
  const removeTaskFromWorkGroup = (groupIndex: number, taskIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      workGroups: prev.workGroups.map((wg, i) =>
        i === groupIndex
          ? {
              ...wg,
              workTasks: wg.workTasks.filter((_, ti) => ti !== taskIndex),
            }
          : wg
      ),
    }));
  };

  // Update task in work group
  const updateTaskInWorkGroup = (
    groupIndex: number,
    taskIndex: number,
    field: "workTask" | "order",
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      workGroups: prev.workGroups.map((wg, i) => {
        if (i === groupIndex) {
          return {
            ...wg,
            workTasks: wg.workTasks.map((wt, ti) => {
              if (ti === taskIndex) {
                if (field === "order") {
                  const newOrder =
                    typeof value === "string" ? parseInt(value) : value;
                  const usedOrders = wg.workTasks
                    .filter((_, otherIndex) => otherIndex !== taskIndex)
                    .map((wt) => wt.order);
                  let finalOrder = newOrder;
                  while (usedOrders.includes(finalOrder)) {
                    finalOrder++;
                  }
                  return { ...wt, [field]: finalOrder };
                } else if (field === "workTask") {
                  return { ...wt, [field]: value.toString() };
                } else {
                  return { ...wt, [field]: value };
                }
              }
              return wt;
            }),
          };
        }
        return wg;
      }),
    }));
  };

  // Create work
  const createWork = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Work created successfully!");
        setShowCreateForm(false);
        await fetchWork();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to create work" }));
        setError(errorData.message || "Failed to create work");
      }
    } catch (err) {
      setError("Failed to create work");
      console.error("Error creating work:", err);
    }
    setSaving(false);
  };

  // Update work
  const updateWork = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Work updated successfully!");
        setIsEditing(false);
        await fetchWork();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to update work" }));
        setError(errorData.message || "Failed to update work");
      }
    } catch (err) {
      setError("Failed to update work");
      console.error("Error updating work:", err);
    }
    setSaving(false);
  };

  // Delete work
  const deleteWork = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccess("Work deleted successfully!");
        setWork(null);
        setShowCreateForm(true);
        setDeleteConfirm(false);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to delete work" }));
        setError(errorData.message || "Failed to delete work");
      }
    } catch (err) {
      setError("Failed to delete work");
      console.error("Error deleting work:", err);
    }
    setSaving(false);
  };

  // Reset form to initial state or existing work data
  const resetForm = () => {
    if (work) {
      setFormData({
        name: work.name || "",
        description: work.description || "",
        workGroups: work.workGroups || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        workGroups: [],
      });
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Works Management
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Delete Button */}
      {work && !isEditing && !showCreateForm && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Work
          </Button>
        </Box>
      )}

      {/* Display Work Data */}
      {work && !isEditing && !showCreateForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">{work.name}</Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setIsEditing(true);
                resetForm();
              }}
            >
              Update
            </Button>
          </Box>

          <Typography variant="body1" color="text.secondary" gutterBottom>
            {work.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Work Groups & Tasks
          </Typography>

          {work.workGroups && work.workGroups.length > 0 ? (
            work.workGroups
              .sort((a, b) => a.order - b.order)
              .map((wg, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center">
                      <DragIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="subtitle1">
                        {getWorkGroupName(wg.workGroup)} (Order: {wg.order})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tasks:
                      </Typography>
                      {wg.workTasks && wg.workTasks.length > 0 ? (
                        wg.workTasks
                          .sort((a, b) => a.order - b.order)
                          .map((wt, taskIndex) => (
                            <Chip
                              key={taskIndex}
                              label={`${getWorkTaskName(wt.workTask)} (Order: ${wt.order})`}
                              sx={{ m: 0.5 }}
                              variant="outlined"
                            />
                          ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No tasks assigned
                        </Typography>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
          ) : (
            <Typography color="text.secondary">
              No work groups assigned
            </Typography>
          )}
        </Paper>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || isEditing) && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {showCreateForm ? "Create New Work" : "Update Work"}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Work Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Work Groups</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addWorkGroup}
                >
                  Add Work Group
                </Button>
              </Box>

              {formData.workGroups.map((wg, groupIndex) => (
                <Card key={groupIndex} sx={{ mb: 2, p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="subtitle1">
                      Work Group {groupIndex + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeWorkGroup(groupIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <FormControl fullWidth>
                        <InputLabel>Select Work Group</InputLabel>
                        <Select
                          value={wg.workGroup}
                          label="Select Work Group"
                          onChange={(e) =>
                            updateWorkGroup(
                              groupIndex,
                              "workGroup",
                              e.target.value as string
                            )
                          }
                        >
                          {workGroupsData.map((group) => (
                            <MenuItem key={group.id} value={group.id}>
                              {group.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Order"
                        type="number"
                        value={wg.order}
                        onChange={(e) =>
                          updateWorkGroup(
                            groupIndex,
                            "order",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="subtitle2">Tasks</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => addTaskToWorkGroup(groupIndex)}
                        disabled={!wg.workGroup}
                      >
                        Add Task
                      </Button>
                    </Box>

                    {wg.workTasks.map((wt, taskIndex) => (
                      <Box
                        key={taskIndex}
                        display="flex"
                        gap={1}
                        mb={1}
                        alignItems="center"
                      >
                        <FormControl sx={{ minWidth: 200, flex: 1 }}>
                          <InputLabel>Select Task</InputLabel>
                          <Select
                            value={wt.workTask}
                            label="Select Task"
                            onChange={(e) =>
                              updateTaskInWorkGroup(
                                groupIndex,
                                taskIndex,
                                "workTask",
                                e.target.value as string
                              )
                            }
                            disabled={!wg.workGroup}
                          >
                            {getTasksForWorkGroup(wg.workGroup).map((task) => (
                              <MenuItem key={task.id} value={task.id}>
                                {task.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Order"
                          type="number"
                          value={wt.order}
                          onChange={(e) =>
                            updateTaskInWorkGroup(
                              groupIndex,
                              taskIndex,
                              "order",
                              parseInt(e.target.value)
                            )
                          }
                          sx={{ width: 80 }}
                        />
                        <IconButton
                          color="error"
                          onClick={() =>
                            removeTaskFromWorkGroup(groupIndex, taskIndex)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Card>
              ))}
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={showCreateForm ? createWork : updateWork}
              disabled={saving || !formData.name.trim()}
            >
              {saving
                ? "Saving..."
                : showCreateForm
                  ? "Create Work"
                  : "Update Work"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => {
                if (showCreateForm) {
                  setShowCreateForm(false);
                  resetForm();
                } else {
                  setIsEditing(false);
                  resetForm();
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this work? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button color="error" onClick={deleteWork} disabled={saving}>
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorksManagement;
