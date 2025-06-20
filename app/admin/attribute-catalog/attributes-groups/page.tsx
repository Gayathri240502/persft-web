"use client";
import React, { useState, useCallback, useEffect } from "react";
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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface AttributeReference {
  _id: string;
}

interface AttributeGroup {
  _id: string;
  name: string;
  description: string;
  attributes?: AttributeReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

// Industry standard debounce hook with proper cleanup and dependencies
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

const AttributeGroups = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAttributeGroups = async () => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attribute groups.");
      }

      const result = await response.json();

      if (Array.isArray(result.attributeGroups)) {
        const groupsWithMeta = result.attributeGroups.map(
          (item: AttributeGroup, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
          })
        );

        setAttributeGroups(groupsWithMeta);
        setRowCount(result.total || 0);
      } else {
        setAttributeGroups([]);
        setRowCount(0);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setAttributeGroups([]);
    } finally {
      setLoading(false);
    }
  };
  [paginationModel, debouncedSearch, token];

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/admin/attribute-catalog/attributes-groups/add");
  }, [router]);

  useEffect(() => {
    fetchAttributeGroups();
  }, [paginationModel, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups/${deleteId}`,
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
        throw new Error(errorData.message || "Delete failed.");
      }

      setConfirmOpen(false);
      setDeleteId(null);
      fetchAttributeGroups();
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  const Columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },

    {
      field: "attributes",
      headerName: "Attributes",
      flex: 1,
      renderCell: (params) => {
        const attributes = params.row?.attributes;

        if (!Array.isArray(attributes) || attributes.length === 0) {
          return <span>N/A</span>;
        }

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {attributes.map((a) => (
              <Button
                key={a._id}
                variant="text"
                size="small"
                onClick={() =>
                  router.push(
                    `/admin/attribute-catalog/attributes/${a.attributeId}`
                  )
                }
                style={{
                  textTransform: "none",
                  padding: "2px 6px",
                  minWidth: 0,
                }}
              >
                {a?.attributeDetails?.name || "Unknown"}
              </Button>
            ))}
          </div>
        );
      },
    },

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/attribute-catalog/attributes-groups/${params.row.id}`
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
                `/admin/attribute-catalog/attributes-groups/edit?id=${params.row.id}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setDeleteId(params.row._id);
              setConfirmOpen(true);
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
      <Navbar label="Attribute Groups" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
          Attribute Groups
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

        <Box sx={{ height: 500, width: "100%", position: "relative" }}>
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
            columns={Columns}
            rows={attributeGroups}
            rowCount={rowCount}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchPlaceholder="Search Attribute Groups..."
            addButtonText="Add"
            getRowId={(row) => row.id}
            // Add these props for better UX
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this attribute group? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AttributeGroups;
