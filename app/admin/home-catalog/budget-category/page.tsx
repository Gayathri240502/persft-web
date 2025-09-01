"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
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
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import Image from "next/image"; // ✅ added for thumbnail rendering

interface BudgetCategory {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string; // ✅ added thumbnail field
  createdAt: string;
  updatedAt: string;
  id?: string;
  sn?: number;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const BudgetCategories = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useTokenAndRole();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });
      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-categories?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (Array.isArray(result.data)) {
        const formatted = result.data.map((item: any, index: number) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        }));
        setCategories(formatted);
        setRowCount(result.total || 0);
      } else {
        setCategories([]);
        setRowCount(0);
      }
    } catch (error: any) {
      console.error("Error fetching budget categories:", error);
      setError(
        error.name === "AbortError"
          ? "Request timeout. Please try again."
          : "An error occurred while fetching budget categories."
      );
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [debouncedSearch, search]);

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId || !token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-categories/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete category: ${response.status} ${response.statusText}`
        );
      }

      await fetchCategories();
      handleDeleteCancel();
    } catch (error: any) {
      console.error("Delete error:", error);
      setError(
        error.name === "AbortError"
          ? "Delete request timeout. Please try again."
          : error instanceof Error
          ? error.message
          : "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/admin/home-catalog/budget-category/add");
  }, [router]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/admin/home-catalog/budget-category/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/home-catalog/budget-category/edit?id=${id}`);
    },
    [router]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", width: 70 },
      { field: "name", headerName: "Name", flex: 1 },
      { field: "description", headerName: "Description", flex: 1 },
      {
        field: "thumbnail",
        headerName: "Thumbnail",
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          params.row.thumbnail ? (
            <Image
              src={params.row.thumbnail}
              alt="thumbnail"
              width={50}
              height={50}
              style={{ borderRadius: "4px", objectFit: "cover" }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No Image
            </Typography>
          ),
      },
      {
        field: "createdAt",
        headerName: "Created At",
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          new Date(params.row.createdAt).toLocaleDateString(),
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleView(params.row.id)}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEdit(params.row.id)}
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
    ],
    [handleEdit, handleView]
  );

  return (
    <>
      <Navbar label="Budget Categories" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {error && (
          <Box sx={{ mb: 2, color: "error.main", textAlign: "center" }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <Box sx={{ width: "100%" }}>
          <StyledDataGrid
            columns={columns}
            rows={categories}
            rowCount={rowCount}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            disableAllSorting
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchPlaceholder="Search Budget Categories..."
            addButtonText="Add"
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default BudgetCategories;
