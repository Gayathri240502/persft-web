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
} from "@mui/material";
import {
  GridColDef,
  GridCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Interfaces
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;
    const queryParams = new URLSearchParams({
      page: String(page + 1),
      limit: String(pageSize),
    });

    if (search.trim()) {
      queryParams.append("searchTerm", search.trim());
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch works");

      const result = await res.json();
      console.log("API result:", result); // ✅ Debug log

      const worksArray = Array.isArray(result)
        ? result
        : Array.isArray(result.works)
          ? result.works
          : Array.isArray(result.docs)
            ? result.docs
            : result._id
              ? [result]
              : [];

      const worksData: Work[] = worksArray.map((item: any, index: number) => ({
        ...item,
        id: item._id,
        sn: page * pageSize + index + 1,
      }));

      setWorks(worksData);
      setRowCount(result.totalDocs || worksData.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setWorks([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search, token]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete work");

      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
      fetchWorks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
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
      renderCell: (params: GridCellParams) => {
        const workGroups: WorkGroupEntry[] = params.row.workGroups || [];

        return workGroups.length === 0 ? (
          <Typography>None</Typography>
        ) : (
          <Box>
            {workGroups.map((wg, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Typography fontWeight="bold" variant="body2">
                  Group ID: {wg.workGroup} (Order: {wg.order})
                </Typography>
                {wg.workTasks.length === 0 ? (
                  <Typography variant="body2" sx={{ pl: 1 }}>
                    No tasks
                  </Typography>
                ) : (
                  wg.workTasks.map((task, idx) => (
                    <Typography key={idx} variant="body2" sx={{ pl: 1 }}>
                      ↳ Task ID: {task.workTask} (Order: {task.order})
                    </Typography>
                  ))
                )}
              </Box>
            ))}
          </Box>
        );
      },
    },
    // {
    //   field: "action",
    //   headerName: "Action",
    //   flex: 1,
    //   renderCell: (params: GridCellParams) => (
    //     <Box>
    //       <IconButton
    //         color="info"
    //         size="small"
    //         onClick={() => router.push(`/admin/work/works/${params.row.id}`)}
    //       >
    //         <Visibility />
    //       </IconButton>
    //       <IconButton
    //         color="primary"
    //         size="small"
    //         onClick={() =>
    //           router.push(`/admin/work/works/edit?id=${params.row.id}`)
    //         }
    //       >
    //         <Edit />
    //       </IconButton>
    //       <IconButton
    //         color="error"
    //         size="small"
    //         onClick={() => handleDeleteClick(params.row.id)}
    //       >
    //         <Delete />
    //       </IconButton>
    //     </Box>
    //   ),
    // },
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
        <ReusableButton onClick={() => router.push("/admin/work/works/add")}>
          ADD
        </ReusableButton>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : works.length === 0 ? (
        <Typography>No works found.</Typography>
      ) : (
        <>
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
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Work</DialogTitle>
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

export default WorkList;
