"use client";

import React, { useState, useEffect } from "react";
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
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

// Interfaces
interface RoomTypesReference {
  _id: string;
  name: string;
}

interface ThemeType {
  _id: string;
  name: string;
  description: string;
  roomTypes: RoomTypesReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

const ThemesPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [themes, setThemes] = useState<ThemeType[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const { token } = getTokenAndRole();

  const fetchThemes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/themes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch themes: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result.themes)) {
        const themesWithExtras = result.themes.map(
          (item: ThemeType, index: number) => ({
            ...item,
            id: item._id,
            sn: paginationModel.page * paginationModel.pageSize + index + 1,
          })
        );

        setThemes(themesWithExtras);
        setRowCount(result.total || result.themes.length);
      } else {
        setThemes([]);
        setRowCount(0);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [paginationModel, search]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedThemeId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedThemeId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/themes/${selectedThemeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete theme: ${response.status}`);
      }

      fetchThemes(); // Refresh data
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete theme.");
    } finally {
      handleDeleteCancel();
    }
  };

  const filteredThemes = themes.filter((theme) =>
    Object.values(theme)
      .flatMap((val) =>
        Array.isArray(val)
          ? val.map((sub) =>
              typeof sub === "object" ? JSON.stringify(sub) : sub
            )
          : typeof val === "object"
            ? JSON.stringify(val)
            : val
      )
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 1 },
    { field: "name", headerName: "Theme Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: (params) => (
        <img
          src={params.row.thumbnail}
          alt="Thumbnail"
          style={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      field: "roomTypes",
      headerName: "Room Types",
      flex: 1,
      valueGetter: (params: { row: ThemeType }) =>
        params.row?.roomTypes && params.row.roomTypes.length > 0
          ? params.row.roomTypes.map((r) => r.name || "Unknown").join(", ")
          : "N/A",
    },
    { field: "archive", headerName: "Archived", flex: 1, type: "boolean" },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() =>
              router.push(`/admin/home-catalog/themes/${params.row.id}`)
            }
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/home-catalog/themes/edit?id=${params.row.id}`)
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSelectedThemeId(params.row._id);
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
        Themes
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
        <ReusableButton onClick={() => router.push("themes/add")}>
          ADD
        </ReusableButton>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 400, width: "100%", overflowX: "auto" }}>
        <StyledDataGrid
          rows={filteredThemes}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Theme</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive this theme? This action cannot be
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

export default ThemesPage;
