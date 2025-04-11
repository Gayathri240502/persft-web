"use client";
import ReusableButton from "@/app/components/Button";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Define the type for residence type entries
interface ResidenceType {
  id: string;
  sn: number;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
}

// Define the columns for the data grid
const columns: GridColDef[] = [
  { field: "sn", headerName: "SN", width: 80 },
  { field: "name", headerName: "Name", width: 200 },
  { field: "description", headerName: "Description", width: 270 },
  { field: "thumbnail", headerName: "Thumbnail", width: 200 },
  { field: "archive", headerName: "Archive", width: 200, type: "boolean" },
  {
    field: "action",
    headerName: "Action",
    width: 200,
    renderCell: (params) => (
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

const ResidenceTypePage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);
  const { token } = getTokenAndRole();

  const fetchResidenceTypes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch residence types:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Fetched residence types:", result);

      if (Array.isArray(result.residenceTypes)) {
        const typesWithId = result.residenceTypes.map((item, index) => ({
          ...item,
          id: item._id,
          sn: index + 1,
        }));
        setResidenceTypes(typesWithId);
      } else {
        setResidenceTypes([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setResidenceTypes([]);
    }
  };

  useEffect(() => {
    fetchResidenceTypes();
  }, []);

  const filteredData = residenceTypes.filter((type) =>
    Object.values(type).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Residence Types
      </Typography>

      {/* Search & Add Button */}
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
          onClick={() => router.push("/admin/home-catalog/residence-types/add")}
        >
          ADD
        </ReusableButton>
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
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
