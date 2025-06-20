"use client";

import React, { useState, useCallback, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Button,
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
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Category {
  _id: string;
  name: string;
}

interface AttributeGroupReference {
  _id: string;
  name: string;
}

interface SubCategoryType {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  category?: Category;
  attributeGroups?: AttributeGroupReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SubCategory = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<SubCategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const { token } = getTokenAndRole();
  const debouncedSearch = useDebounce(search, 300);

  const fetchSubCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });

      if (debouncedSearch.trim()) {
        queryParams.set("searchTerm", debouncedSearch.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sub-categories: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result.subCategories)) {
        const dataWithMeta = result.subCategories.map(
          (item: SubCategoryType, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
            category: item.category || { _id: "", name: "N/A" },
            attributeGroups: item.attributeGroups || [],
          })
        );
        setRows(dataWithMeta);
        setRowCount(result.total || 0);
      } else {
        setRows([]);
        setRowCount(0);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, token]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  const handleDeleteConfirm = async () => {
    if (selectedCategoryId) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${selectedCategoryId}`,
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

        fetchSubCategories();
        setDeleteDialogOpen(false);
        setSelectedCategoryId(null);
      } catch {
        setError("Failed to delete category");
      }
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/admin/product-catalog/sub-category/add");
  }, [router]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCategoryId(null);
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Name", flex: 0.8 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.thumbnail ? (
          <img
            src={params.row.thumbnail}
            alt="Thumbnail"
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No Image
          </Typography>
        ),
    },

    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => (
        <span
          onClick={() =>
            router.push(`/admin/product-catalog/category/${params.row._id}`)
          }
          style={{ color: "#1976d2", cursor: "pointer" }}
        >
          {params.row?.category?.name || "N/A"}
        </span>
      ),
    },
    {
      field: "attributeGroups",
      headerName: "Attribute Groups",
      flex: 1,
      renderCell: (params) => {
        const groups = params.row?.attributeGroups;
        if (!Array.isArray(groups) || groups.length === 0) return "N/A";

        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {groups.map((group) => (
              <span
                key={group._id}
                style={{ color: "#1976d2", cursor: "pointer" }}
                onClick={() =>
                  router.push(
                    `/admin/product-catalog/category/${params.row.id}`
                  )
                }
              >
                {group?.name || "Unnamed"}
              </span>
            ))}
          </Box>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/product-catalog/sub-category/${params.row.id}`
              )
            }
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/product-catalog/sub-category/edit?id=${params.row.id}`
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
    <>
      <Navbar label=" Sub Category" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Sub Category
      </Typography> */}

        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            gap: isSmallScreen ? 2 : 1,
          }}
        ></Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ width: "100%" }}>
          <StyledDataGrid
            columns={columns}
            rows={rows}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            rowCount={rowCount}
            paginationMode="server"
            autoHeight
            disableColumnMenu={isSmallScreen}
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchPlaceholder="Search Sub Category..."
            addButtonText="Add"
            getRowId={(row) => row.id}
            // Add these props for better UX
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this category? This action cannot
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

export default SubCategory;
