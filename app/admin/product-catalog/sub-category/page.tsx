"use client";

import ReusableButton from "@/app/components/Button";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {  GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete } from "@mui/icons-material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

// Interfaces
interface Category {
  _id: string;
  name: string;
}

interface AttributeGroupReference {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  category?: Category; // optional to avoid runtime crash
  attributeGroups?: AttributeGroupReference[];
  archive: boolean;
  id?: string;
  sn?: number;
}

const SubCategory = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = getTokenAndRole();

  const fetchSubCategories = async () => {
    setLoading(true);
    setError(null); // Reset error before making the request

    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sub-categories: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched sub-categories:", result);

      if (Array.isArray(result.subCategories)) {
        const dataWithMeta = result.subCategories.map(
          (item: SubCategory, index: number) => ({
            ...item,
            id: item._id,
            sn: page * pageSize + index + 1,
            category: item.category || { _id: "", name: "N/A" },
            attributeGroups: item.attributeGroups || [],
          })
        );

        setRows(dataWithMeta);
        setRowCount(result.totalDocs || dataWithMeta.length);
      } else {
        setRows([]);
        setRowCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching sub-categories:", err);
      setError(err.message || "Something went wrong");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [paginationModel, search]);

  // Columns
  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 0.8 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="Thumbnail"
          style={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (params: { row: SubCategory }) =>
        params.row?.category?.name ? params.row.category.name : "N/A",
    },
    {
      field: "attributeGroups",
      headerName: "Attribute Groups",
      flex: 1,
      valueGetter: (params: { row: SubCategory }) => {
        const groups = params.row?.attributeGroups;
        if (!Array.isArray(groups)) return "N/A";
        return groups.map((g) => g?.name || "Unnamed").join(", ");
      },
    },
    {
      field: "archive",
      headerName: "Archived",
      flex: 0.5,
      type: "boolean",
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
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
        Sub Category
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
            router.push("/admin/product-catalog/sub-category/add");
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
        <Button variant="outlined" size="small">
          Show Rows
        </Button>
        <Button variant="outlined" size="small">
          Copy
        </Button>
        <Button variant="outlined" size="small">
          CSV
        </Button>
        <Button variant="outlined" size="small">
          Excel
        </Button>
        <Button variant="outlined" size="small">
          PDF
        </Button>
        <Button variant="outlined" size="small">
          Print
        </Button>
      </Box>

      {/* Show Loading Spinner */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Show Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <StyledDataGrid
          columns={columns}
          rows={rows}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          rowCount={rowCount}
          paginationMode="server"
          autoHeight
          disableColumnMenu={isSmallScreen}
        />
      </Box>
    </Box>
  );
};

export default SubCategory;
