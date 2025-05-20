"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  GridColDef,
  GridCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { Edit } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface WorkTaskEntry {
  workTask: string;
  order: number;
}

interface WorkGroupEntry {
  workGroup: string;
  order: number;
  workTasks: WorkTaskEntry[];
}

interface Work {
  _id: string;
  id?: string;
  sn?: number;
  name: string;
  description: string;
  archive: boolean;
  workGroups: WorkGroupEntry[];
}

interface WorkGroup {
  _id: string;
  id?: string;
  name?: string;
  title?: string;
}

interface WorkTask {
  _id: string;
  id?: string;
  name?: string;
  title?: string;
  workGroupId?: string;
  workGroup?: string;
  groupId?: string;
}

const WorkFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Work | null;
  token: string;
}> = ({ open, onClose, onSuccess, editData, token }) => {
  const [name, setName] = useState(editData?.name || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>([]);
  const [selectedWorkTasks, setSelectedWorkTasks] = useState<string[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Fetch work groups and tasks
  const fetchWorkGroupsAndTasks = useCallback(async () => {
    if (!token) return;
    setLoadingResources(true);

    try {
      // Fetch work groups
      const groupsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!groupsRes.ok) throw new Error("Failed to fetch work groups");
      const groupsData = await groupsRes.json();

      // Handle different response formats
      const groupsArray = Array.isArray(
        groupsData?.docs || groupsData?.workGroups || groupsData
      )
        ? groupsData.docs || groupsData.workGroups || groupsData
        : groupsData._id
          ? [groupsData]
          : [];

      setWorkGroups(groupsArray);

      // Fetch work tasks
      const tasksRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!tasksRes.ok) throw new Error("Failed to fetch work tasks");
      const tasksData = await tasksRes.json();

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
      setLoadingResources(false);
    }
  }, [token]);

  useEffect(() => {
    if (open) {
      fetchWorkGroupsAndTasks();
    }
  }, [fetchWorkGroupsAndTasks, open]);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);

      // Set selected work groups from editData
      const groupIds = editData.workGroups.map((wg) => wg.workGroup);
      setSelectedWorkGroups(groupIds);

      // Set selected work tasks from editData
      const taskIds = editData.workGroups.flatMap((wg) =>
        wg.workTasks.map((task) => task.workTask)
      );
      setSelectedWorkTasks(taskIds);
    } else {
      setName("");
      setDescription("");
      setSelectedWorkGroups([]);
      setSelectedWorkTasks([]);
    }
    setError(null);
  }, [editData, open]);

  const handleWorkGroupChange = (groupId: string) => {
    setSelectedWorkGroups((prev) => {
      const isSelected = prev.includes(groupId);

      // If deselecting a group, also deselect all its tasks
      if (isSelected) {
        const groupTasks = workTasks
          .filter((task) => task.workGroupId === groupId)
          .map((task) => task._id);

        setSelectedWorkTasks((prev) =>
          prev.filter((taskId) => !groupTasks.includes(taskId))
        );

        return prev.filter((id) => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleWorkTaskChange = (taskId: string, groupId: string) => {
    setSelectedWorkTasks((prev) => {
      const isSelected = prev.includes(taskId);

      // If selecting a task, also select its group
      if (!isSelected) {
        if (!selectedWorkGroups.includes(groupId)) {
          setSelectedWorkGroups((prev) => [...prev, groupId]);
        }
        return [...prev, taskId];
      } else {
        return prev.filter((id) => id !== taskId);
      }
    });
  };

  const prepareWorkGroupsData = () => {
    const result: WorkGroupEntry[] = [];

    selectedWorkGroups.forEach((groupId, groupIndex) => {
      const groupTasks = workTasks
        .filter(
          (task) =>
            task.workGroupId === groupId && selectedWorkTasks.includes(task._id)
        )
        .map((task, taskIndex) => ({
          workTask: task._id,
          order: taskIndex,
        }));

      if (groupTasks.length > 0 || true) {
        // Include even if no tasks selected
        result.push({
          workGroup: groupId,
          order: groupIndex,
          workTasks: groupTasks,
        });
      }
    });

    return result;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const method = editData ? "PUT" : "POST";
    const url = editData
      ? `${process.env.NEXT_PUBLIC_API_URL}/works/${editData._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/works`;

    const workGroupsData = prepareWorkGroupsData();

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    { field: "sn", headerName: "SN", width: 70 },
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "workGroups",
      headerName: "Work Groups & Tasks",
      flex: 3,
      renderCell: (params: GridCellParams) => (
        <Box>
          {(params.row.workGroups || []).map((wg: any, i: number) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography fontWeight="bold" variant="body2">
                Group ID: {wg.workGroup} (Order: {wg.order})
              </Typography>
              {(wg.workTasks || []).map((task: any, idx: number) => (
                <Typography key={idx} variant="body2" sx={{ pl: 1 }}>
                  ↳ Task ID: {task.workTask} (Order: {task.order})
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setEditData(params.row);
              setFormOpen(true);
            }}
          >
            <Edit />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Works
      </Typography>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
        />
        <ReusableButton
          onClick={() => {
            setEditData(null);
            setFormOpen(true);
          }}
        >
          ADD
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
          rows={works}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          autoHeight
        />
      )}

      <WorkFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchWorks}
        editData={editData}
        token={token}
      />
    </Box>
  );
};

export default WorkList;
