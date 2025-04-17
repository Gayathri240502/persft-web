"use client";
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete } from "@mui/icons-material";
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

  const fetchAttributes = async () => {
    const { page, pageSize } = paginationModel;

    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

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
      setRowCount(result.totalCount || dataWithSN.length);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, [paginationModel, search]);

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

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.4 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "type", headerName: "Type", flex: 0.7 },
    { field: "archive", headerName: "Archived", type: "boolean", flex: 0.5 },
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
                `/admin/attribute-catalog/attributes/edit/${params.row._id}`
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
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Attributes
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          justifyContent: "space-between",
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
          onClick={() => router.push("/admin/attribute-catalog/attributes/add")}
        >
          ADD
        </ReusableButton>
      </Box>

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
          columns={columns}
          rows={attributes}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          loading={loading}
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
          <ReusableButton variant="outlined" onClick={handleDeleteCancel}>
            Cancel
          </ReusableButton>
          <ReusableButton
            color="error"
            onClick={handleDeleteConfirm}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </ReusableButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attributes;
