"use client";
import React, { useEffect, useCallback, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Attribute {
  _id: string;
  name: string;
  description: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "date"
    | "color"
    | "textarea"
    | "email"
    | "url";
  archive: boolean;
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

const Attributes = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(
    null
  );

  const { token } = getTokenAndRole();
  const debouncedSearch = useDebounce(search, 300);

  const fetchAttributes = async () => {
    const { page, pageSize } = paginationModel;

    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });

      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attributes?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }

      const result = await response.json();

      const dataWithSN = (result.attributes || []).map(
        (item: any, index: number) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        })
      );

      setAttributes(dataWithSN);
      setRowCount(result.total || 0);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, [paginationModel, , debouncedSearch]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedAttributeId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAttributeId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attributes/${selectedAttributeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete attribute.");
      }

      setDeleteDialogOpen(false);
      setSelectedAttributeId(null);
      fetchAttributes(); // refresh data
    } catch (err: any) {
      setError(err.message || "Error deleting attribute.");
    } finally {
      setLoading(false);
    }
  };
  [paginationModel, debouncedSearch, token];

  // Effect to reset pagination when search changes
  useEffect(() => {
    // Reset to first page when search term changes
    if (debouncedSearch !== search) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [debouncedSearch, search]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/admin/attribute-catalog/attributes/add");
  }, [router]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.4 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "type", headerName: "Type", flex: 0.7 },

    {
      field: "action",
      headerName: "Action",
      flex: 0.8,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/attribute-catalog/attributes/${params.row.id}`
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
                `/admin/attribute-catalog/attributes/edit?id=${params.row.id}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSelectedAttributeId(params.row._id);
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
      <Navbar label="Attributes" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
          Attributes
        </Typography> */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            gap: isSmallScreen ? 2 : 1,
          }}
        ></Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ width: "100%", position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <StyledDataGrid
            columns={columns}
            rows={attributes}
            rowCount={rowCount}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchPlaceholder="Search Attributes..."
            addButtonText="Add"
            getRowId={(row) => row.id}
            // Add these props for better UX
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Attribute</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this attribute? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button
              color="error"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Attributes;
