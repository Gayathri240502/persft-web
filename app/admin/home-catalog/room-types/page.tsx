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
import {
  GridColDef,
  GridPaginationModel,
  GridCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Interfaces
interface ResidenceTypeReference {
  _id: string;
  name: string;
}

interface RoomType {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  residenceTypes: ResidenceTypeReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

// Component
const RoomTypes = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [rowCount, setRowCount] = useState(0);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const { token } = getTokenAndRole();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const fetchRoomTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      // API expects 1-based index for page
      const page = paginationModel.page + 1;
      const limit = paginationModel.pageSize;
      const sortField = "createdAt"; // adjust as needed
      const sortOrder = "desc";

      // Fix the URL template string syntax and properly encode the search term
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/room-types?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&searchTerm=${encodeURIComponent(search)}`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room types");
      }

      const result = await response.json();

      // Calculate serial number correctly based on pagination
      const startIndex = (page - 1) * limit;

      const fetchedRoomTypes = Array.isArray(result.roomTypes)
        ? result.roomTypes.map((item: RoomType, index: number) => ({
            ...item,
            id: item._id,
            sn: startIndex + index + 1,
            residenceTypes: Array.isArray(item.residenceTypes)
              ? item.residenceTypes
              : [],
          }))
        : [];

      setRoomTypes(fetchedRoomTypes);
      setRowCount(result.total || 0);
      console.log(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [paginationModel.page, paginationModel.pageSize, search]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/room-types/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete room type");
      }

      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
      fetchRoomTypes();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete item"
      );
    }
  };

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Room Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: (params) =>
        params.row.thumbnail ? (
          <img
            src={params.row.thumbnail}
            alt="Thumbnail"
            style={{ width: 40, height: 40 }}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No Image
          </Typography>
        ),
    },
    {
      field: "residenceTypes",
      headerName: "Residence Types",
      flex: 2,
      renderCell: (params: GridCellParams) => {
        const resTypes = params.row.residenceTypes || [];
        return resTypes.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {resTypes.map((res) => (
              <Button
                key={res._id}
                variant="text"
                size="small"
                onClick={() =>
                  router.push(`/admin/home-catalog/residence-types/${res._id}`)
                }
              >
                {res.name}
              </Button>
            ))}
          </Box>
        ) : (
          "N/A"
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() =>
              router.push(`/admin/home-catalog/room-types/${params.row.id}`)
            }
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/home-catalog/room-types/edit?id=${params.row.id}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
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
        Room Types
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel({ ...paginationModel, page: 0 });
          }}
        />
        <ReusableButton
          onClick={() => router.push("/admin/home-catalog/room-types/add")}
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
          rows={roomTypes}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          loading={loading}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Room Type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this room type? This action cannot
            be undone.
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

export default RoomTypes;
