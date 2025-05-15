"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";

import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import ReusableButton from "@/app/components/Button";
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

interface WorkProject {
  id: string;
  name: string;
  description: string;
  archive: boolean;
  workGroups: WorkGroupEntry[];
  sn?: number;
}

const Projects = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [work, setWork] = useState<WorkProject[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [groupMap, setGroupMap] = useState<Record<string, string>>({});
  const [taskMap, setTaskMap] = useState<Record<string, string>>({});

  const { token } = getTokenAndRole();

  const fetchNames = useCallback(async () => {
    try {
      if (!token) return;
      const [groupRes, taskRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/work-groups`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/dropdowns/work-tasks/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      const [groupData, taskData] = await Promise.all([
        groupRes.json(),
        taskRes.json(),
      ]);

      const groupObj = Object.fromEntries(
        groupData.map((g: any) => [g._id, g.name])
      );
      const taskObj = Object.fromEntries(
        taskData.map((t: any) => [t._id, t.name])
      );

      setGroupMap(groupObj);
      setTaskMap(taskObj);
    } catch (err) {
      console.error("Failed to fetch group/task names", err);
    }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    if (!token) return;

    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });

      if (search.trim() !== "") {
        queryParams.append("searchTerm", search.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch projects");

      const result = await response.json();
      const projectList = Array.isArray(result?.projects)
        ? result.projects
        : Array.isArray(result)
          ? result
          : [];

      const formatted = projectList.map((item: any, index: number) => ({
        ...item,
        id: item._id,
        sn: page * pageSize + index + 1,
      }));

      setWork(formatted);
      setRowCount(result?.totalDocs || formatted.length);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setWork([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search, token]);

  useEffect(() => {
    fetchNames();
  }, [fetchNames]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [fetchProjects]);

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId || !token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete project");

      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
      fetchProjects();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      renderCell: (params) => <Typography>{params.row.name}</Typography>,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Typography>{params.row.description}</Typography>,
    },
    {
      field: "workGroups",
      headerName: "Work Groups & Tasks",
      flex: 3,
      renderCell: (params) => {
        const workGroups: WorkGroupEntry[] = params.row.workGroups || [];

        return (
          <Box>
            {workGroups.map((wg, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Group: {groupMap[wg.workGroup] || wg.workGroup} (Order:{" "}
                  {wg.order})
                </Typography>
                {wg.workTasks.length === 0 ? (
                  <Typography variant="body2" sx={{ pl: 1 }}>
                    No tasks
                  </Typography>
                ) : (
                  wg.workTasks.map((task, idx) => (
                    <Typography key={idx} variant="body2" sx={{ pl: 1 }}>
                      ↳ Task: {taskMap[task.workTask] || task.workTask} (Order:{" "}
                      {task.order})
                    </Typography>
                  ))
                )}
              </Box>
            ))}
          </Box>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() => router.push(`/admin/work/work/${params.row.id}`)}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/work/work/edit?id=${params.row.id}`)
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Work
      </Typography>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}
      >
        <TextField
          label="Search"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
        />
        <ReusableButton onClick={() => router.push("/admin/work/work/add")}>
          ADD
        </ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <StyledDataGrid
          rows={work}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={isSmallScreen ? [5, 10] : [5, 10, 25, 100]}
          autoHeight
          disableColumnMenu={isSmallScreen}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
