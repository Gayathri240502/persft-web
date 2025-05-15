"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";

import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import ReusableButton from "@/app/components/Button";

interface Kiosk {
  _id: string;
  firstName: string;
  lastName: string;
  description: string;
  address: string;
  countryName: string;
  stateName: string;
  cityName: string;
  projects: string[];
  projectNames: string[];
  id?: string;
  sn?: number;
}

const KioskManagement = () => {
  const router = useRouter();
  const theme = useTheme();
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);

  // Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    const fetchKiosks = async () => {
      setLoading(true);
      setError(null);

      try {
        const { page, pageSize } = paginationModel;
        const queryParams = new URLSearchParams({
          page: String(page + 1),
          limit: String(pageSize),
          searchTerm: debouncedSearch,
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const result = await res.json();

        const mappedData =
          result.kiosks?.map((item: Kiosk, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
          })) || [];

        setKiosks(mappedData);
        setRowCount(result.total || 0);
      } catch (err: any) {
        setError(err.message || "Unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchKiosks();
  }, [paginationModel, debouncedSearch]);

  const handleDeleteKiosk = async () => {
    if (!selectedKiosk) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${selectedKiosk._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to delete: ${res.status}`);
      }

      setDeleteDialogOpen(false);
      setSelectedKiosk(null);
      setPaginationModel((prev) => ({ ...prev })); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.3 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "countryName", headerName: "Country", flex: 1 },
    { field: "stateName", headerName: "State", flex: 1 },
    { field: "cityName", headerName: "City", flex: 1 },
    {
      field: "projectNames",
      headerName: "Related Projects",
      flex: 1.5,
      renderCell: (params) =>
        params.value?.length > 0
          ? params.value.join(", ")
          : "No Related Projects",
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() =>
              router.push(`/admin/kiosk-management/${params.row.id}`)
            }
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() =>
              router.push(
                `/admin/kiosk-management/edit?id=${params.row.id}`
              )
            }
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              setSelectedKiosk(params.row);
              setDeleteDialogOpen(true);
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Kiosk Management
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
        <ReusableButton
          onClick={() => router.push("/admin/kiosk-management/add")}
        >
          ADD
        </ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <StyledDataGrid
          rows={kiosks}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          autoHeight
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this kiosk?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteKiosk} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KioskManagement;
