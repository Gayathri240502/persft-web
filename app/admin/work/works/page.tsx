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

      // Handle different response formats
      const tasksArray = Array.isArray(
        tasksData?.docs || tasksData?.workTasks || tasksData
      )
        ? tasksData.docs || tasksData.workTasks || tasksData
        : tasksData._id
          ? [tasksData]
          : [];

      setWorkTasks(tasksArray);
    } catch (err: any) {
      console.error("Error fetching work groups and tasks:", err);
      setError(
        `${err.message || "Failed to load resources"}. Please check API endpoints.`
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
        body: JSON.stringify({
          name,
          description,
          archive: editData?.archive || false,
          workGroups: workGroupsData,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Save failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Group tasks by their work group
  const getTasksByGroup = (groupId: string) => {
    return workTasks.filter(
      (task) =>
        task.workGroupId === groupId ||
        task.workGroup === groupId ||
        task.groupId === groupId
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{editData ? "Edit Work" : "Add Work"}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          margin="normal"
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Work Groups & Tasks
          </Typography>

          {loadingResources ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box>
              {workGroups.length === 0 ? (
                <Alert severity="info">
                  No work groups available. (expecting:{" "}
                  {process.env.NEXT_PUBLIC_API_URL}/work-groups and
                  {process.env.NEXT_PUBLIC_API_URL}/work-tasks)
                </Alert>
              ) : (
                workGroups.map((group) => (
                  <Accordion key={group._id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedWorkGroups.includes(group._id)}
                            onChange={() => handleWorkGroupChange(group._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label={
                          <Typography fontWeight="medium">
                            {group.name || group.title || `Group ${group._id}`}
                          </Typography>
                        }
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mr: 2 }}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormGroup sx={{ pl: 3 }}>
                        {getTasksByGroup(group._id).map((task) => (
                          <FormControlLabel
                            key={task._id}
                            control={
                              <Checkbox
                                checked={selectedWorkTasks.includes(task._id)}
                                onChange={() =>
                                  handleWorkTaskChange(task._id, group._id)
                                }
                                disabled={
                                  !selectedWorkGroups.includes(group._id)
                                }
                              />
                            }
                            label={task.name}
                          />
                        ))}
                        {getTasksByGroup(group._id).length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No tasks available for this work group
                          </Typography>
                        )}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !description.trim()}
          variant="contained"
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WorkList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const [token, setToken] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [works, setWorks] = useState<Work[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<Work | null>(null);

  useEffect(() => {
    const { token } = getTokenAndRole();
    setToken(token);
  }, []);

  const fetchWorks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;
    const queryParams = new URLSearchParams({
      page: String(page + 1),
      limit: String(pageSize),
    });

    if (search.trim()) queryParams.append("searchTerm", search.trim());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to fetch");

      const worksArray = Array.isArray(result?.docs || result?.works || result)
        ? result.docs || result.works || result
        : result._id
          ? [result]
          : [];

      setWorks(
        worksArray.map((item: any, index: number) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        }))
      );
      setRowCount(result.totalDocs || worksArray.length);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setWorks([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search, token]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

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