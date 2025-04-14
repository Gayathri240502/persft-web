"use client";
import ReusableButton from "@/app/components/Button";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface ResidenceType {
  id: string;
  sn: number;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
}

const ResidenceTypePage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);

  const { token } = getTokenAndRole();

  const fetchResidenceTypes = async () => {
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1), // Backend usually expects 1-based page
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/residence-types?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch residence types:", response.status);
        return;
      }

      const result = await response.json();

      const typesWithId = (result.residenceTypes || []).map(
        (item: any, index: number) => ({
          ...item,
          id: item._id,
          sn: page * pageSize + index + 1,
        })
      );

      setResidenceTypes(typesWithId);
      setRowCount(result.totalCount || 0);
    } catch (error) {
      console.error("Error:", error);
      setResidenceTypes([]);
    }
  };

  useEffect(() => {
    fetchResidenceTypes();
  }, [paginationModel, search]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 80 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "description", headerName: "Description", width: 270 },
    { field: "thumbnail", headerName: "Thumbnail", width: 200 },
    { field: "archive", headerName: "Archive", width: 120, type: "boolean" },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      renderCell: () => (
        <div>
          <IconButton color="info" size="small">
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton color="primary" size="small">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small">
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Residence Types
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
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
        />
        <ReusableButton
          onClick={() =>
            router.push("/admin/home-catalog/residence-types/add")
          }
        >
          ADD
        </ReusableButton>
      </Box>

      <Box sx={{ height: 500, width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={residenceTypes}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model: GridPaginationModel) =>
            setPaginationModel(model)
          }
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

export default ResidenceTypePage;
