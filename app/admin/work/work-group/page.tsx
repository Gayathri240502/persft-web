"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface WorkGroup {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  id?: string;
  sn?: number;
}

const WorkGroups = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workGroupToDelete, setWorkGroupToDelete] = useState<WorkGroup | null>(
    null
  );
  const { token } = getTokenAndRole();

  const fetchWorkGroups = async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-groups?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result.workGroups)) {
        const formatted = result.workGroups.map((item, index) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        }));

        setWorkGroups(formatted);
        setRowCount(result.totalDocs || formatted.length);
      } else {
        setWorkGroups([]);
        setRowCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching work groups:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkGroups();
  }, [paginationModel, search]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "archive",
      headerName: "Archive",
      flex: 0.5,
      type: "boolean",
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/home-catalog/work-groups/edit?id=${params.row.id}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>

          <IconButton
            color="error"
            size="small"
            onClick={() => handleOpenDeleteDialog(params.row)} // Open delete confirmation dialog
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleOpenDeleteDialog = (workGroup: WorkGroup) => {
    setWorkGroupToDelete(workGroup);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWorkGroupToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!workGroupToDelete) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-groups/${workGroupToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete work group. Status: ${response.status}`
        );
      }

      fetchWorkGroups(); // Refetch work groups after deletion
      handleDeleteCancel(); // Close the dialog
    } catch (err: any) {
      console.error("Error deleting work group:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Work Groups
      </Typography>

      {/* Search and Add Button Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
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
          onChange={(e) => setSearch(e.target.value)}
        />
        <ReusableButton
          onClick={() => router.push("/admin/work/work-group/add")}
        >
          ADD
        </ReusableButton>
      </Box>

      {/* Loading and Error State */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <StyledDataGrid
            rows={workGroups}
            columns={columns}
            pagination
            rowCount={rowCount}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableColumnMenu={isSmallScreen}
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Work Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this work group? This action cannot
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
  );
};

export default WorkGroups;
