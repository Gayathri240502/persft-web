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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Merchant {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  archive: boolean;
  businessName: string;
  address: string;
  category: string;
  subCategory: string;
  categoryName: string;
  subCategoryName: string;
}

interface MerchantResponse {
  merchants: Merchant[];
  total: number;
}

const Merchant = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = getTokenAndRole();

  const fetchMerchants = async () => {
    const { page, pageSize } = paginationModel;

    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: String(page + 1), // DataGrid is 0-based, API is 1-based
        limit: String(pageSize),
        searchTerm: search,
      });

      console.log("Fetching merchants → page:", page + 1, "limit:", pageSize);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }

      const result: MerchantResponse = await response.json();
      console.log("API response:", result);

      if (!Array.isArray(result.merchants)) {
        throw new Error("Invalid data format: merchants not found");
      }

      if (typeof result.total !== "number") {
        throw new Error("Invalid data format: total count missing");
      }

      const dataWithSN = result.merchants.map((merchant, index) => ({
        ...merchant,
        id: merchant._id,
        sn: page * pageSize + index + 1,
      }));

      setRows(dataWithSN);
      setRowCount(result.total);
    } catch (err: any) {
      console.error("Error fetching merchants:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [paginationModel, search]);

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

   const handleAdd = useCallback(() => {
      router.push("/admin/vendors/merchants/add");
    }, [router]);

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
      }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete residence type");
      }

      fetchMerchants();
      handleDeleteCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.4 },
    { field: "firstName", headerName: "First Name", flex: 0.8 },
    { field: "lastName", headerName: "Last Name", flex: 0.8 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "businessName", headerName: "Business Name", flex: 1 },

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
              router.push(`/admin/vendors/merchants/${params.row.keycloakId}`)
            }
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/vendors/merchants/edit?id=${params.row.keycloakId}`
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
    <>
      <Navbar label="Merchants" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {/* <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
          Merchants
        </Typography> */}

        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
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
            onClick={() => router.push("/admin/vendors/merchants/add")}
          >
            ADD
          </ReusableButton>
        </Box> */}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box>
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
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            onAdd={handleAdd}
            onSearch={handleSearchChange}
          />
        </Box>
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this residence type? This action
              cannot be undone.
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

export default Merchant;
