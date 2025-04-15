"use client";
import ReusableButton from "@/app/components/Button";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface AttributeReference {
  _id: string;
}

interface AttributeGroup {
  _id: string;
  name: string;
  description: string;
  attributes?: AttributeReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

const AttributeGroups = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = getTokenAndRole();

  const fetchAttributeGroups = async () => {
    const { page, pageSize } = paginationModel;

    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attribute groups.");
      }

      const result = await response.json();

      if (Array.isArray(result.attributeGroups)) {
        const groupsWithMeta = result.attributeGroups.map(
          (item: AttributeGroup, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
          })
        );

        setAttributeGroups(groupsWithMeta);
        setRowCount(result.totalDocs || groupsWithMeta.length);
      } else {
        setAttributeGroups([]);
        setRowCount(0);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setAttributeGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributeGroups();
  }, [paginationModel, search]);

  const Columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "attributes",
      headerName: "Attributes",
      flex: 1,
      valueGetter: (params) => {
        const attrs = params.row?.attributes;
        return Array.isArray(attrs) && attrs.length > 0
          ? attrs.map((a: any) => a._id).join(", ")
          : "N/A";
      },
    },
    {
      field: "archive",
      headerName: "Archived",
      flex: 1,
      type: "boolean",
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
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Attribute Groups
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
            router.push("/admin/attribute-catalog/attributes-groups/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, width: "100%", position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <DataGrid
          columns={Columns}
          rows={attributeGroups}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          loading={loading}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: isSmallScreen ? "0.8rem" : "1rem",
              backgroundColor: "#f1f1f1",
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

export default AttributeGroups;
