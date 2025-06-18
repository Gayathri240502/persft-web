"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface WorkGroup {
  _id: string;
  name: string;
}

interface WorkTask {
  _id: string;
  name: string;
  description: string;
  workGroup?: WorkGroup;
  targetDays: number;
  bufferDays: number;
  poDays: number;
  archive: boolean;
  id?: string;
  sn?: number;
}

const WorkTasksPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchWorkTasks = async () => {
    setLoading(true);
    setError("");
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-tasks?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const result = await response.json();
      const formatted = result.workTasks.map(
        (task: WorkTask, index: number) => ({
          ...task,
          id: task._id,
          sn: page * pageSize + index + 1,
          workGroup: task.workGroup ? task.workGroup : { name: "N/A" },
        })
      );

      setTasks(formatted);
      setRowCount(result.total || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Failed to fetch work tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkTasks();
  }, [paginationModel, search]);

  const handleDeleteClick = (id: string) => {
    setSelectedTaskId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTaskId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaskId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-tasks/${selectedTaskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);

      handleDeleteCancel();
      fetchWorkTasks(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete work task");
    }
  };

  const handleAdd = useCallback(() => {
      router.push("/admin/work/work-task/add");
    }, [router]);

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
      }, []);

  const columns: GridColDef<WorkTask>[] = [
    { field: "sn", headerName: "SN", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1.5 },
    {
      field: "workGroup",
      headerName: "Work Group",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const handleClick = () => {
          router.push(`/admin/work/work-group/${params.row.workGroup?._id}`);
        };

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Typography
              onClick={handleClick}
              sx={{ color: "primary.main", cursor: "pointer" }}
              variant="body2"
            >
              {params.row?.workGroup?.name || "N/A"}
            </Typography>
          </Box>
        );
      },
    },
    { field: "targetDays", headerName: "Target Days", flex: 0.8 },
    { field: "bufferDays", headerName: "Buffer Days", flex: 0.8 },
    { field: "poDays", headerName: "PO Days", flex: 0.8 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params: GridRenderCellParams<WorkTask>) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() =>
              router.push(`/admin/work/work-task/${params.row.id}`)
            }
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/work/work-task/edit?id=${params.row.id}`)
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id!)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Navbar label="Work Tasks" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Work Tasks
      </Typography> */}

        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={isSmallScreen}
          />
          <ReusableButton
            onClick={() => router.push("/admin/work/work-task/add")}
          >
            ADD
          </ReusableButton>
        </Box> */}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ width: "100%" }}>
          <StyledDataGrid
            columns={columns}
            rows={tasks}
            rowCount={rowCount}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            loading={loading}
            autoHeight
            disableColumnMenu={isSmallScreen}
            onAdd={handleAdd}
            onSearch={handleSearchChange}
          />
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this work task? This action cannot
              be undone.
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
    </>
  );
};

export default WorkTasksPage;
