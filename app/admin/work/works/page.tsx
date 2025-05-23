"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Edit, Delete, Add } from "@mui/icons-material";

import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import CancelButton from "@/app/components/CancelButton";

export interface Project {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  workGroups: WorkGroupAssignment[];
  id?: string;
  sn: number;
}

export interface WorkGroupAssignment {
  workGroup: string; // ID reference to a WorkGroup
  order: number;
  workTasks: WorkTaskAssignment[];
}

export interface WorkTaskAssignment {
  workTask: string; // ID reference to a WorkTask
  order: number;
}

export interface WorkGroup {
  _id: string;
  name: string;
  description: string;
}

export interface WorkTask {
  _id: string;
  name: string;
  description: string;
  workGroup: string;
}

const WorkGroupsTasksPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [allRows, setAllRows] = useState<Project[]>([]);
  const [rows, setRows] = useState<Project[]>([]);
  const [rowCount, setRowCount] = useState(0);

  // Available work groups and tasks
  const [availableWorkGroups, setAvailableWorkGroups] = useState<WorkGroup[]>([]);
  const [availableWorkTasks, setAvailableWorkTasks] = useState<WorkTask[]>([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    description: string;
    workGroups: WorkGroupAssignment[];
  }>({
    id: "",
    name: "",
    description: "",
    workGroups: [
      {
        workGroup: "",
        order: 0,
        workTasks: [
          {
            workTask: "",
            order: 0,
          },
        ],
      },
    ],
  });

  // Fetch available work groups and tasks
  const fetchWorkGroupsAndTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works/work-groups-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

      const data = await res.json();
      
      // Assuming the API returns { workGroups: [], workTasks: [] }
      if (data.workGroups) {
        setAvailableWorkGroups(data.workGroups);
      }
      if (data.workTasks) {
        setAvailableWorkTasks(data.workTasks);
      }
    } catch (err) {
      console.error("Failed to fetch work groups and tasks:", err);
      setError("Failed to load work groups and tasks");
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

      const data = await res.json();

      // Handle both single item and array responses
      const projects: Project[] = Array.isArray(data) 
        ? data.map((item, index) => ({
            id: item._id,
            _id: item._id,
            sn: index + 1,
            name: item.name || "",
            description: item.description || "",
            archive: item.archive || false,
            workGroups: item.workGroups || []
          }))
        : [{
            id: data._id,
            _id: data._id,
            sn: 1,
            name: data.name || "",
            description: data.description || "",
            archive: data.archive || false,
            workGroups: data.workGroups || []
          }];

      setAllRows(projects);
      setRowCount(projects.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkGroupsAndTasks();
    fetchProjects();
  }, []);

  useEffect(() => {
    const filtered = allRows.filter(
      (row) =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.description.toLowerCase().includes(search.toLowerCase())
    );
    const start = paginationModel.page * paginationModel.pageSize;
    const paginated = filtered.slice(start, start + paginationModel.pageSize);

    setRows(paginated);
    setRowCount(filtered.length);
  }, [search, paginationModel, allRows]);

  const handleSubmit = async () => {
    if (!formData.id) {
      setError("No project selected for editing.");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/works`;

    const requestBody = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      workGroups: formData.workGroups,
    };

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        setError(
          `Failed to update: ${errorDetails.message || "Unknown error"}`
        );
        throw new Error(
          `Failed to update: ${errorDetails.message || "Unknown error"}`
        );
      }

      setSuccessMsg("Project updated successfully");
      setEditDialogOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleEditClick = (params: GridRenderCellParams) => {
    setFormData({
      id: params.row.id,
      name: params.row.name,
      description: params.row.description,
      workGroups: params.row.workGroups || [
        {
          workGroup: "",
          order: 0,
          workTasks: [{ workTask: "", order: 0 }],
        },
      ],
    });
    setEditDialogOpen(true);
  };

  // When clicking "Add", open edit dialog for the first available project
  const handleAddClick = () => {
    if (allRows.length > 0) {
      const firstProject = allRows[0];
      setFormData({
        id: firstProject.id || firstProject._id,
        name: firstProject.name,
        description: firstProject.description,
        workGroups: firstProject.workGroups || [
          {
            workGroup: "",
            order: 0,
            workTasks: [{ workTask: "", order: 0 }],
          },
        ],
      });
      setEditDialogOpen(true);
    } else {
      setError("No projects available to edit");
    }
  };

  const addWorkGroup = () => {
    setFormData({
      ...formData,
      workGroups: [
        ...formData.workGroups,
        {
          workGroup: "",
          order: formData.workGroups.length,
          workTasks: [{ workTask: "", order: 0 }],
        },
      ],
    });
  };

  const removeWorkGroup = (index: number) => {
    const newWorkGroups = formData.workGroups.filter((_, i) => i !== index);
    setFormData({ ...formData, workGroups: newWorkGroups });
  };

  const updateWorkGroup = (index: number, workGroupId: string) => {
    const newWorkGroups = [...formData.workGroups];
    newWorkGroups[index].workGroup = workGroupId;
    // Reset work tasks when work group changes
    newWorkGroups[index].workTasks = [{ workTask: "", order: 0 }];
    setFormData({ ...formData, workGroups: newWorkGroups });
  };

  const addWorkTask = (workGroupIndex: number) => {
    const newWorkGroups = [...formData.workGroups];
    newWorkGroups[workGroupIndex].workTasks.push({
      workTask: "",
      order: newWorkGroups[workGroupIndex].workTasks.length,
    });
    setFormData({ ...formData, workGroups: newWorkGroups });
  };

  const removeWorkTask = (workGroupIndex: number, taskIndex: number) => {
    const newWorkGroups = [...formData.workGroups];
    newWorkGroups[workGroupIndex].workTasks = newWorkGroups[workGroupIndex].workTasks.filter(
      (_, i) => i !== taskIndex
    );
    setFormData({ ...formData, workGroups: newWorkGroups });
  };

  const updateWorkTask = (workGroupIndex: number, taskIndex: number, workTaskId: string) => {
    const newWorkGroups = [...formData.workGroups];
    newWorkGroups[workGroupIndex].workTasks[taskIndex].workTask = workTaskId;
    setFormData({ ...formData, workGroups: newWorkGroups });
  };

  const getWorkGroupName = (workGroupId: string) => {
    const workGroup = availableWorkGroups.find(wg => wg._id === workGroupId);
    return workGroup ? workGroup.name : workGroupId;
  };

  const getWorkTaskName = (workTaskId: string) => {
    const workTask = availableWorkTasks.find(wt => wt._id === workTaskId);
    return workTask ? workTask.name : workTaskId;
  };

  const getFilteredWorkTasks = (workGroupId: string) => {
    return availableWorkTasks.filter(task => task.workGroup === workGroupId);
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 50 },
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.name}</Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.description}</Typography>
      ),
    },
    {
      field: "workGroups",
      headerName: "Work Groups",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {params.row.workGroups?.map((wg: WorkGroupAssignment, index: number) => (
            <Typography key={index} variant="body2">
              {getWorkGroupName(wg.workGroup)} ({wg.workTasks?.length || 0} tasks)
            </Typography>
          ))}
        </Box>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            onClick={() => handleEditClick(params)}
            size="small"
            color="primary"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Work Groups & Tasks Management
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          flexDirection: isSmallScreen ? "column" : "row",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          fullWidth={isSmallScreen}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel({ ...paginationModel, page: 0 });
          }}
        />
        <ReusableButton onClick={handleAddClick} disabled={allRows.length === 0}>
          EDIT PROJECT
        </ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <StyledDataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          disableColumnMenu={isSmallScreen}
          autoHeight
        />
      )}

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent sx={{ mt: 2, px: 2, py: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Project Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />
            <TextField
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Work Groups</Typography>
                <Button startIcon={<Add />} onClick={addWorkGroup} size="small">
                  Add Work Group
                </Button>
              </Box>

              {formData.workGroups.map((workGroup, workGroupIndex) => (
                <Box key={workGroupIndex} sx={{ border: 1, borderColor: "grey.300", p: 2, mb: 2, borderRadius: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1">Work Group {workGroupIndex + 1}</Typography>
                    {formData.workGroups.length > 1 && (
                      <IconButton onClick={() => removeWorkGroup(workGroupIndex)} size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Work Group</InputLabel>
                    <Select
                      value={workGroup.workGroup}
                      onChange={(e) => updateWorkGroup(workGroupIndex, e.target.value)}
                      label="Select Work Group"
                    >
                      {availableWorkGroups.map((wg) => (
                        <MenuItem key={wg._id} value={wg._id}>
                          {wg.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ ml: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle2">Work Tasks</Typography>
                      <Button 
                        startIcon={<Add />} 
                        onClick={() => addWorkTask(workGroupIndex)} 
                        size="small"
                        disabled={!workGroup.workGroup}
                      >
                        Add Task
                      </Button>
                    </Box>

                    {workGroup.workTasks.map((workTask, taskIndex) => (
                      <Box key={taskIndex} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                        <FormControl fullWidth>
                          <InputLabel>Select Work Task</InputLabel>
                          <Select
                            value={workTask.workTask}
                            onChange={(e) => updateWorkTask(workGroupIndex, taskIndex, e.target.value)}
                            label="Select Work Task"
                            disabled={!workGroup.workGroup}
                          >
                            {getFilteredWorkTasks(workGroup.workGroup).map((wt) => (
                              <MenuItem key={wt._id} value={wt._id}>
                                {wt.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {workGroup.workTasks.length > 1 && (
                          <IconButton 
                            onClick={() => removeWorkTask(workGroupIndex, taskIndex)} 
                            size="small" 
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={() => setEditDialogOpen(false)}>Cancel</CancelButton>
          <ReusableButton variant="contained" onClick={handleSubmit}>
            Update
          </ReusableButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        message={successMsg}
      />
    </Box>
  );
};

export default WorkGroupsTasksPage;