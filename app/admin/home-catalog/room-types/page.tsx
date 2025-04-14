"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import ReusableButton from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const { token } = getTokenAndRole();

  // Fetch Room Types
  const fetchRoomTypes = async () => {
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1), // Assuming backend uses 1-based index
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room-types?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch room types:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Fetched room types raw:", result);

      if (Array.isArray(result.roomTypes)) {
        const typesWithId = result.roomTypes.map((item, index) => ({
          ...item,
          residenceTypes: Array.isArray(item.residenceTypes)
            ? item.residenceTypes
            : [],
          id: item._id,
          sn: page * pageSize + index + 1,
        }));

        setRoomTypes(typesWithId);
        setRowCount(result.totalDocs || typesWithId.length); // fallback
      } else {
        setRoomTypes([]);
        setRowCount(0);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
      setRoomTypes([]);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [paginationModel, search]);

  // Table columns
  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 80 },
    { field: "name", headerName: "Room Name", width: 180 },
    { field: "description", headerName: "Description", width: 220 },
    {
      field: "residenceTypes",
      headerName: "Residence Types",
      width: 250,
      valueGetter: (params) => {
        const resTypes: ResidenceTypeReference[] = params.row?.residenceTypes;
        return Array.isArray(resTypes) && resTypes.length > 0
          ? resTypes.map((r) => r.name || "Unknown").join(", ")
          : "N/A";
      },
    },
    {
      field: "archive",
      headerName: "Archived",
      width: 100,
      type: "boolean",
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      renderCell: (params) => (
        <Box>
          <IconButton color="info" size="small">
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton color="primary" size="small">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small">
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel({ ...paginationModel, page: 0 }); // reset to first page
          }}
        />
        <ReusableButton
          onClick={() => router.push("/admin/home-catalog/room-types/add")}
        >
          ADD
        </ReusableButton>
      </Box>

      <Box sx={{ height: 400, width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={roomTypes}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: isSmallScreen ? "0.8rem" : "1rem",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#f9f9f9",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#ffffff",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default RoomTypes;
