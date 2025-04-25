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
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid"; // Ensure this is correctly imported
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
}

const KioskManagement = () => {
  const router = useRouter();
  const theme = useTheme();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);

  const { token } = getTokenAndRole();

  const fetchKiosks = async () => {
    setLoading(true);
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch kiosks: ${response.status}`);
      }

      const result = await response.json();

      const kioskWithIds = (result.kiosks || []).map(
        (item: any, index: number) => ({
          ...item,
          id: item._id,  // Make sure this is the correct identifier
          sn: page * pageSize + index + 1,  // Serial number to display
        })
      );

      setKiosks(kioskWithIds);
      setRowCount(result.total || 0);  // Set total count for pagination
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKiosk = async () => {
    if (selectedKiosk) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${selectedKiosk._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete kiosk: ${response.status}`);
        }

        // After successful deletion, refetch kiosks
        fetchKiosks();
        setDeleteDialogOpen(false); // Close the dialog
        setSelectedKiosk(null); // Clear the selected kiosk
      } catch (err) {
        setError(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }
  };

  useEffect(() => {
    fetchKiosks();
  }, [paginationModel, search]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.3, sortable: false },
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
      renderCell: (params) => (
        <Typography>
          {params.value?.length > 0
            ? params.value.join(", ")
            : "No Related Projects"}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => router.push(`/admin/kiosk-management/${params.row.id}`)}
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/kiosk-management/edit?id=${params.row.id}`)
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSelectedKiosk(params.row);
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
    <Box sx={{ p: theme.spacing(3) }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Kiosk Management
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
  <TextField
    label="Search"
    variant="outlined"
    size="small"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    sx={{ width: "300px" }} // control the width as needed
  />

  <ReusableButton onClick={() => router.push("/admin/kiosk-management/add")}>
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
        <Box sx={{ height: 500, width: "100%", overflowX: "auto" }}>
          <StyledDataGrid
            rows={kiosks}  // The data you fetched from the API
            columns={columns}  // Columns for the grid
            rowCount={rowCount}  // Total number of rows
            loading={loading}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(model: GridPaginationModel) =>
              setPaginationModel(model)
            }
            pageSizeOptions={[5, 10, 25]}
            autoHeight
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this kiosk?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteKiosk}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KioskManagement;
