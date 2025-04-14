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

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const { token } = getTokenAndRole();

  const fetchThemes = async () => {
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
        console.error("Failed to fetch themes:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Fetched themes:", result);

      if (Array.isArray(result.themes)) {
        const themesWithExtras = result.themes.map((item, index) => ({
          ...item,
          id: item._id,
          sn: paginationModel.page * paginationModel.pageSize + index + 1,
        }));
        setThemes(themesWithExtras);
        setRowCount(result.total || result.themes.length);
      } else {
        setThemes([]);
        setRowCount(0);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
      setThemes([]);
      setRowCount(0);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [paginationModel, search]);

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
    { field: "sn", headerName: "SN", flex:1 },
    { field: "name", headerName: "Theme Name",flex:1 },
    { field: "description", headerName: "Description", flex:1 },
    {
      field: "roomTypes",
      headerName: "Room Types",
      flex:1,
      valueGetter: (params) => {
        const roomTypes: RoomTypesReference[] = params.row?.roomTypes;
        if (Array.isArray(roomTypes) && roomTypes.length > 0) {
          return roomTypes.map((r) => r.name || "Unknown").join(", ");
        }
        return "N/A";
      },
    },
    { field: "archive", headerName: "Archived",flex:1, type: "boolean" },
    {
      field: "action",
      headerName: "Action",
      flex:1,
      renderCell: () => (
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
        <ReusableButton onClick={() => router.push("themes/add")}>ADD</ReusableButton>
      </Box>

      <Box sx={{ height: 400, width: "100%", overflowX: "auto" }}>
        <DataGrid
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

export default ThemesPage;
