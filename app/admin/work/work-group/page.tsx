"use client";

import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
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
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
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

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

const WorkGroups = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
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

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const { token } = useTokenAndRole();

  useEffect(() => {
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [debouncedSearch]);

  const fetchWorkGroups = useCallback(async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        _ts: Date.now().toString(),
      });

      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

      const finalUrl = `${process.env.NEXT_PUBLIC_API_URL}/work-groups?${queryParams}`;
      console.log("Fetching work groups with searchTerm:", debouncedSearch);
      console.log("Final URL:", finalUrl);

      const response = await fetch(finalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Result:", result);

      if (mountedRef.current) {
        if (Array.isArray(result.workGroups)) {
          const formatted = result.workGroups.map(
            (item: WorkGroup, index: number) => ({
              ...item,
              id: item._id,
              sn: page * pageSize + index + 1,
            })
          );

          setWorkGroups(formatted);
          setRowCount(result.total || 0);
        } else {
          setWorkGroups([]);
          setRowCount(0);
        }
      }
    } catch (err: any) {
      console.error("Error fetching work groups:", err);
      if (mountedRef.current) {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [paginationModel, debouncedSearch, token]);

  useEffect(() => {
    if (token) fetchWorkGroups();
  }, [fetchWorkGroups, token]);

  const handleAdd = useCallback(() => {
    router.push("/admin/work/work-group/add");
  }, [router]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleOpenDeleteDialog = useCallback((workGroup: WorkGroup) => {
    setWorkGroupToDelete(workGroup);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setWorkGroupToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
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

      await fetchWorkGroups();
      handleDeleteCancel();
    } catch (err: any) {
      console.error("Error deleting work group:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [workGroupToDelete, token, fetchWorkGroups, handleDeleteCancel]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", flex: 0.5 },
      { field: "name", headerName: "Name", flex: 1 },
      { field: "description", headerName: "Description", flex: 2 },
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
                router.push(`/admin/work/work-group/${params.row._id}`)
              }
            >
              <Visibility />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                router.push(`/admin/work/work-group/edit?id=${params.row._id}`)
              }
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleOpenDeleteDialog(params.row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [router, handleOpenDeleteDialog]
  );

  return (
    <>
      <Navbar label="Work Groups" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {loading && workGroups.length === 0 ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <Box sx={{ width: "100%" }}>
            <StyledDataGrid
              rows={workGroups}
              columns={columns}
              pagination
              rowCount={rowCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 100]}
              autoHeight
              disableColumnMenu={isSmallScreen}
              getRowId={(row) => row.id}
              onSearch={handleSearch}
              searchPlaceholder="Search Work Groups..."
              onAdd={handleAdd}
              loading={loading}
            />
          </Box>
        )}

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Work Group</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this work group? This action
              cannot be undone.
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

export default WorkGroups;
