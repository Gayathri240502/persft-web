"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Category {
  _id?: string;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
  id?: string;
  sn?: number;
}

const Category = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const { token } = getTokenAndRole();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const fetchCategory = async () => {
    setLoading(true);
    setError("");

    const page = paginationModel.page + 1; // 1-based index for API
    const limit = paginationModel.pageSize;
    const searchTermParam = search
      ? `&searchTerm=${encodeURIComponent(search)}`
      : "";

    const url = `${process.env.NEXT_PUBLIC_API_URL}/categories?page=${page}&limit=${limit}${searchTermParam}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Fetched categories:", result);

      if (Array.isArray(result.categories)) {
        const categoryWithExtras = result.categories.map(
          (item: any, index: number) => ({
            ...item,
            id: item._id,
            sn: paginationModel.page * paginationModel.pageSize + index + 1,
          })
        );
        setCategory(categoryWithExtras);
        setRowCount(result.total || 0);
      } else {
        setCategory([]);
        setRowCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Something went wrong");
      setCategory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [paginationModel, search]);

  const handleDeleteConfirm = async () => {
    if (selectedCategoryId) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategoryId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete category: ${response.statusText}`);
        }

        fetchCategory(); // Refresh data
        setDeleteDialogOpen(false);
        setSelectedCategoryId(null);
      } catch (error) {
        setError("Failed to delete category");
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCategoryId(null);
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: (params) => (
        <img
          src={params.row.thumbnail}
          alt="Thumbnail"
          style={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/product-catalog/category/${params.row.id}`)
            }
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/product-catalog/category/edit?id=${params.row.id}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSelectedCategoryId(params.row.id);
              setDeleteDialogOpen(true);
            }}
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
        Category
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
          onChange={(e) => setSearch(e.target.value)}
        />
        <ReusableButton
          onClick={() => {
            router.push("/admin/product-catalog/category/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Loading categories...</Typography>
        </Box>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ width: "100%" }}>
        <StyledDataGrid
          rows={category}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          autoHeight
          disableColumnMenu={isSmallScreen}
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category? This action cannot be
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

export default Category;
