"use client";

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import {
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Project {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  id?: string;
  sn?: number;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Projects = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { token } = getTokenAndRole();

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearch]);

  const fetchProjects = async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        _ts: Date.now().toString(), // cache buster
      });

      console.log("Fetching projects with", {
        page: page + 1,
        pageSize,
        search: debouncedSearch,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects?${queryParams}`,
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
      console.log("API response:", result);

      if (Array.isArray(result.projects)) {
        const formatted = result.projects.map(
          (item: Project, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
          })
        );

        setProjects(formatted);
        setRowCount(result.totalDocs || result.totalCount || formatted.length);
      } else {
        setProjects([]);
        setRowCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [paginationModel, debouncedSearch]);

  const handleAdd = useCallback(() => {
    router.push("/admin/projects/add");
  }, [router]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleOpenDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete project. Status: ${response.status}`);
      }

      fetchProjects();
      handleDeleteCancel();
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const base64String = params.value;
        return base64String ? (
          <img
            src={`data:image/jpeg;base64,${base64String}`}
            alt="Thumbnail"
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          <span style={{ fontStyle: "italic", color: "#999" }}>
            No Thumbnail
          </span>
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
            color="primary"
            size="small"
            onClick={() => router.push(`/admin/projects/${params.row.id}`)}
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/projects/edit?id=${params.row.id}`)
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
  ];

  return (
    <>
      <Navbar label="Projects" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {loading ? (
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
              rows={projects}
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
              // searchValue={search}
              onAdd={handleAdd}
              onSearch={handleSearch}
              searchPlaceholder="Search Projects..."
              addButtonText="Add Projects"
              loading={loading}
            />
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this project? This action cannot
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

export default Projects;
