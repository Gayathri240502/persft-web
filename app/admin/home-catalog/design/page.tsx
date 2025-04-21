"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { GridColDef, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

// Types for RoomDesign and SelectionReference
interface RoomDesign {
  _id: string;
  name: string;
  description: string;
  coohomUrl: string;
  thumbnail: string;
  selections: SelectionReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

interface SelectionReference {
  _id: string;
}

const DesignType = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [designs, setDesigns] = useState<RoomDesign[]>([]);
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error handling
  const { token } = getTokenAndRole();

  // Fetch Room Types
  const fetchDesigns = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset error

    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1), // Assuming backend uses 1-based index
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/designs?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch designs: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched design types:", result);

      if (Array.isArray(result.designs)) {
        const typesWithId = result.designs.map((item: any, index: any) => ({
          ...item,
          selections: Array.isArray(item.selections) ? item.selections : [],
          id: item._id,
          sn: page * pageSize + index + 1,
        }));

        setDesigns(typesWithId);
        setRowCount(result.totalDocs || typesWithId.length); // fallback
      } else {
        setDesigns([]);
        setRowCount(0);
      }
    } catch (error: any) {
      console.error("Error fetching designs:", error);
      setError("An error occurred while fetching the design types."); // Set error message
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [paginationModel, search]);

  // Column Definitions
  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "thumbnail", headerName: "Thumbnail", flex: 1 },
    {
      field: "selections",
      headerName: "Selections",
      flex: 1,
      valueGetter: (params: GridRenderCellParams) => {
        const selections: SelectionReference[] = params.row?.selections ?? [];
        return Array.isArray(selections) && selections.length > 0
          ? `${selections.length} item(s)`
          : "N/A";
      },
    },
    {
      field: "archive",
      headerName: "Archive",
      flex: 1,
      type: "boolean",
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="error" size="small">
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
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Design Types
      </Typography>

      {/* Search Bar & Add Button Above Table */}
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
        <ReusableButton
          onClick={() => {
            router.push("design/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>

      {/* Error Message */}
      {error && (
        <Box sx={{ mb: 2, color: "error.main", textAlign: "center" }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        // Data Grid
        <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
          <StyledDataGrid
            columns={columns}
            rows={designs}
            rowCount={rowCount}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableColumnMenu={isSmallScreen}
          />
        </Box>
      )}
    </Box>
  );
};

export default DesignType;
