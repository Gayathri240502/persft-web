"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import ReusableButton from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Project {
  _id: string;
  name: string;
  description: string;
  country: string;
  state: string;
  city: string;
  address: string;
  projects: string[];
}

const KioskManagement = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [kiosks, setKiosks] = useState<Project[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

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

      const kioskWithIds = (result.data || []).map(
        (item: any, index: number) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        })
      );

      setKiosks(kioskWithIds);
      setRowCount(result.totalCount || 0);
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKiosks();
  }, [paginationModel, search]);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete kiosk");
      }

      fetchKiosks();
      handleDeleteCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.3, sortable: false },
    { field: "name", headerName: "Project Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "country", headerName: "Country", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    {
      field: "projects",
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
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Kiosk Management
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
        <ReusableButton onClick={() => router.push("kiosk-management/add")}>
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
            rows={kiosks}
            columns={columns}
            rowCount={rowCount}
            loading={loading}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(model) => setPaginationModel(model)}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableColumnMenu={isSmallScreen}
          />
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this kiosk? This action cannot be
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

export default KioskManagement;
