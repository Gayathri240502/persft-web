"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { GridColDef, GridPaginationModel, GridCellParams } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Interfaces
interface WorkTask {
  _id: string;
  name: string;
}

interface WorkGroup {
  _id: string;
  name: string;
  workTasks: WorkTask[];
}

interface Work {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  id?: string;
  sn?: number;
  workGroups: {
    workGroup: string;
    order: number;
    workTasks: {
      workTask: string;
      order: number;
    }[];
  }[];
}

// Component
const WorkList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [works, setWorks] = useState<Work[]>([]);
  const [workGroupMap, setWorkGroupMap] = useState<Record<string, string>>({});
  const [workTaskMap, setWorkTaskMap] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const fetchWorkMappings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works/work-groups-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      const groupMap: Record<string, string> = {};
      const taskMap: Record<string, string> = {};

      data?.workGroups?.forEach((group: any) => {
        groupMap[group._id] = group.name;
        group?.workTasks?.forEach((task: any) => {
          taskMap[task._id] = task.name;
        });
      });

      setWorkGroupMap(groupMap);
      setWorkTaskMap(taskMap);
    } catch (e) {
      console.error("Mapping fetch failed", e);
    }
  };

  const fetchWorks = async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch works");

      const result = await res.json();

      const worksData = result?.works?.map((item: any, index: number) => ({
        ...item,
        id: item._any,
        sn: page * pageSize + index + 1,
      })) || [];

      setWorks(worksData);
      setRowCount(result.totalDocs || worksData.length);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch works");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkMappings();
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [paginationModel, search]);

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works/${selectedDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete work");

      fetchWorks();
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Work Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "workGroups",
      headerName: "Work Groups & Tasks",
      flex: 3,
      renderCell: (params: GridCellParams) => {
        const groups = params.row.workGroups || [];

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {groups.map((group: any, i: number) => (
              <Box key={i}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {workGroupMap[group.workGroup] || "Unknown Group"}
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {group.workTasks.map((task: any, j: number) => (
                    <Typography key={j} variant="body2">
                      • {workTaskMap[task.workTask] || "Unknown Task"}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() => router.push(`/admin/works/${params.row.id}`)}
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() => router.push(`/admin/works/edit?id=${params.row.id}`)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <Delete />
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
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: isSmallScreen ? 2 : 1,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel({ ...paginationModel, page: 0 });
          }}
        />
        <ReusableButton onClick={() => router.push("/admin/works/add")}>
          ADD
        </ReusableButton>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Work</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this work? This action cannot be undone.
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

export default WorkList;
