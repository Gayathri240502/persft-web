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
  Chip,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface User {
  _id: string;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
}

const UserManagement = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKeycloakId, setSelectedKeycloakId] = useState<string | null>(
    null
  );

  const { token } = getTokenAndRole();

  const fetchUsers = async () => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();

      const dataWithSN = (result.users || []).map(
        (user: any, index: number) => ({
          ...user,
          id: user._id,
          sn: page * pageSize + index + 1,
        })
      );

      setUsers(dataWithSN);
      setRowCount(result.total || 0);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [paginationModel, search]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedKeycloakId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedKeycloakId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedKeycloakId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete user.");

      setDeleteDialogOpen(false);
      setSelectedKeycloakId(null);
      fetchUsers(); // refresh list
    } catch (err: any) {
      setError(err.message || "Error deleting user.");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.3 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phone", headerName: "Phone", flex: 1 },
    {
      field: "enabled",
      headerName: "Status",
      flex: 0.6,
      renderCell: (params) => (
        <Chip
          sx={{ width: "70px" }}
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "error"}
          size="medium"
          variant="filled"
        />
      ),
    },

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <div>
          <IconButton
            color="primary"
            size="small"
            onClick={() => router.push(`/admin/users/${params.row.keycloakId}`)}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/users/${params.row.keycloakId}/edit`)
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSelectedKeycloakId(params.row.keycloakId);
              setDeleteDialogOpen(true);
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Users
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
        <ReusableButton onClick={() => router.push("/admin/users/add")}>
          ADD
        </ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: "100%" }}>
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
          rows={users}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          loading={loading}
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be
            undone.
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

export default UserManagement;
