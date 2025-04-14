"use client";
import ReusableButton from "@/app/components/Button";
import React, { useState,useEffect } from "react";
import { Box, Typography, TextField, useMediaQuery, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Attribute {
  _id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'color' | 'textarea' | 'email' | 'url';
  archive: boolean;
}

const Attributes = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
    const [paginationModel, setPaginationModel] = useState({
      page: 0,
      pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
  
    const { token } = getTokenAndRole();
  
    const fetchAttributes = async () => {
      const { page, pageSize } = paginationModel;
  
      try {
        const queryParams = new URLSearchParams({
          page: String(page + 1), // Backend usually expects 1-based page
          limit: String(pageSize),
          searchTerm: search,
        });
  
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/attributes?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!response.ok) {
          console.error("Failed to fetch attributes types:", response.status);
          return;
        }
  
        const result = await response.json();
  
        const typesWithId = (result.attributes || []).map(
          (item: any, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
          })
        );
  
        setAttributes(typesWithId);
        setRowCount(result.totalCount || 0);
      } catch (error) {
        console.error("Error:", error);
        setAttributes([]);
      }
    };
  
    useEffect(() => {
      fetchAttributes();
    }, [paginationModel, search]);



  // Column Definitions
 const columns: GridColDef[] = [
  { field: "sn", headerName: "SN", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "description", headerName: "Description", flex: 1 },
  { field: "type", headerName: "Type", flex: 1 },
  {
    field: "archive",
    headerName: "Archived",
    type: "boolean",
    flex: 1,
  },
  {
    field: "action",
    headerName: "Action",
    flex: 1,
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
      {/* Heading */}
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Attributes
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
        <ReusableButton
          onClick={() => {
            router.push("/admin/attribute-catalog/attributes/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 1,
          mb: 2,
          alignItems: "center",
        }}
      >
        {/* Data Grid */}
        <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
          <DataGrid
            columns={columns}
            rows={attributes}
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
    </Box>
  );
};

export default Attributes;
