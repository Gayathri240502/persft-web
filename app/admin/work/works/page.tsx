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

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [editData]);

  const handleSubmit = async () => {
    setLoading(true);
    const method = editData ? "PUT" : "POST";
    const url = editData
      ? `${process.env.NEXT_PUBLIC_API_URL}/works/${editData._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/works`;

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
          archive: false,
          workGroups: editData?.workGroups || [],
        }),
      });

      const result = await response.json();
      console.log("API Result:", result);

      if (!response.ok) {
        throw new Error(result.message || "Save failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? "Edit Work" : "Add Work"}</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">
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
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<Work | null>(null);

  const fetchWorks = useCallback(async () => {
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

  const handleDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/works/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
      fetchWorks();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
            color="info"
            size="small"
            onClick={() => router.push(`/admin/work/works/${params.row.id}`)}
          >
            <Visibility />
          </IconButton>
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
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSelectedDeleteId(params.row.id);
              setDeleteDialogOpen(true);
            }}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Work</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
