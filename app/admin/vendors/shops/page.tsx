"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Shop {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  archive: boolean;
  ownerName: string;
  keycloakId: string;
}

interface ShopResponse {
  shops: Shop[];
  total: number;
}

const Shop = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const { token } = getTokenAndRole();

  const fetchShops = async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1), // Backend is 1-based
        limit: String(pageSize),
        ...(search && { searchTerm: search }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to fetch data: ${response.statusText}`
        );
      }

      const result: ShopResponse = await response.json();

      console.log("Fetched result:", result);
      console.log("Pagination model:", paginationModel);

      if (Array.isArray(result.shops)) {
        const dataWithSN = result.shops.map((shop, index) => ({
          ...shop,
          id: shop._id || shop.keycloakId,
          sn: page * pageSize + index + 1,
        }));

        setRows(dataWithSN);
        setRowCount(result.total || 0);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err: any) {
      console.error("Error fetching shops:", err);
      setError(err.message || "Failed to load shops. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [paginationModel.page, paginationModel.pageSize, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to delete shop: ${response.statusText}`
        );
      }

      await fetchShops();
      handleDeleteCancel();
    } catch (err: any) {
      console.error("Error deleting shop:", err);
      setError(err.message || "Failed to delete shop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.4 },
    { field: "firstName", headerName: "First Name", flex: 0.8 },
    { field: "lastName", headerName: "Last Name", flex: 0.8 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "ownerName", headerName: "Owner Name", flex: 1 },
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
      flex: 0.8,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/vendors/shops/${params.row.keycloakId}`)
            }
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/vendors/shops/edit?id=${params.row.keycloakId}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.keycloakId)}
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
        Shops
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={handleSearchChange}
          placeholder="Search shops..."
        />
        <ReusableButton onClick={() => router.push("/admin/vendors/shops/add")}>
          ADD
        </ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: "relative", minHeight: "400px" }}>
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
          rows={rows}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          disableColumnMenu={isSmallScreen}
          loading={loading}
          getRowId={(row) => row.id || row._id || row.keycloakId}
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Shop</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Shop? This action cannot be
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

export default Shop;
