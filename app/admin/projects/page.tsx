"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert, // Added for error display
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
  id?: string; // Add id for DataGrid
  sn?: number; // Add sn for serial number
}

// Custom hook for debouncing search input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Projects = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { token } = getTokenAndRole();

  // Debounce the search term
  const debouncedSearch = useDebounce(search, 300); // 300ms debounce delay

  const fetchProjects = useCallback(async () => {
    if (!token) {
      setError("Authentication token not found. Please log in.");
      return;
    }

    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });

      // Only add searchTerm if it's not empty
      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

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
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch projects: ${errorData.message || response.statusText}`
        );
      }

      const result = await response.json();

      if (Array.isArray(result.projects)) {
        const formatted = result.projects.map(
          (item: Project, index: number) => ({
            ...item,
            id: item._id, // Ensure id is present for DataGrid
            sn: page * pageSize + index + 1,
          })
        );
        setProjects(formatted);
        setRowCount(result.totalDocs || 0); // Use totalDocs from API, default to 0
      } else {
        setProjects([]);
        setRowCount(0);
        console.warn("API did not return an array for projects:", result);
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Something went wrong while fetching projects.");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, token]); // Dependencies for useCallback

  // Effect to fetch projects whenever pagination model or debounced search changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Effect to reset page to 0 when the debounced search term changes
  // This prevents issues where a search might result in fewer pages than the current page number
  useEffect(() => {
    if (paginationModel.page !== 0 && search !== debouncedSearch) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [debouncedSearch, search, paginationModel.page]);

  const handleOpenDeleteDialog = useCallback((project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!projectToDelete || !token) return;

    setLoading(true);
    setError(null);

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
        const errorData = await response.json();
        throw new Error(
          `Failed to delete project: ${errorData.message || response.statusText}`
        );
      }

      fetchProjects(); // Re-fetch projects after successful deletion
      handleDeleteCancel();
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "Something went wrong during deletion.");
    } finally {
      setLoading(false);
    }
  }, [projectToDelete, token, fetchProjects, handleDeleteCancel]);

  const handleAdd = useCallback(() => {
    router.push("/admin/projects/add");
  }, [router]);

  // Handle search input change (updates the `search` state immediately)
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // Memoize columns to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", flex: 0.5, minWidth: 50 },
      { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
      { field: "description", headerName: "Description", flex: 2, minWidth: 250 },
      {
        field: "thumbnail",
        headerName: "Thumbnail",
        flex: 1,
        minWidth: 100,
        sortable: false,
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
              loading="lazy" // Add lazy loading for images
            />
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              fontStyle="italic"
            >
              No Image
            </Typography>
          );
        },
      },
      {
        field: "action",
        headerName: "Actions",
        flex: 1,
        minWidth: 150,
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              color="primary"
              size="small"
              onClick={() => router.push(`/admin/projects/${params.row.id}`)}
              title="View Project"
            >
              <Visibility />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                router.push(`/admin/projects/edit?id=${params.row.id}`)
              }
              title="Edit Project"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleOpenDeleteDialog(params.row)}
              title="Delete Project"
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
      <Navbar label="Projects" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* Error State Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading and DataGrid */}
        {loading && !projects.length ? ( // Only show full-screen spinner if no data loaded yet
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
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
              onAdd={handleAdd}
              onSearch={handleSearchChange} // Pass the handleSearchChange function
              getRowId={(row) => row.id || row._id} // Ensure getRowId handles both 'id' and '_id'
            />
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the project "
              <Typography component="span" fontWeight="bold">
                {projectToDelete?.name}
              </Typography>
              "? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Projects;