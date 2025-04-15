"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Category {
  _id?: string;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
  id?: string;
  sn?: number;
}

const Category = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const { token } = getTokenAndRole();

  const fetchCategory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Fetched categories:", result);

      if (Array.isArray(result.categories)) {
        const categoryWithExtras = result.categories.map((item, index) => ({
          ...item,
          id: item._id,
          sn: paginationModel.page * paginationModel.pageSize + index + 1,
        }));
        setCategory(categoryWithExtras);
        setRowCount(result.total || result.categories.length);
      } else {
        setCategory([]);
        setRowCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Something went wrong");
      setCategory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [paginationModel, search]);

  const filteredCategory = category.filter((cat) =>
    Object.values(cat)
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
    { field: "sn", headerName: "SN", width: 80 },
    { field: "name", headerName: "Name", width: 180 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "thumbnail", headerName: "Thumbnail", width: 200 },
    { field: "archive", headerName: "Archived", width: 120, type: "boolean" },
    {
      field: "action",
      headerName: "Action",
      width: 150,
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
        Category
      </Typography>

      {/* Search and Add */}
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
            router.push("/admin/product-catalog/category/add");
          }}
        >
          ADD
        </ReusableButton>
      </Box>

      {/* Export Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 1,
          mb: 2,
          alignItems: "center",
        }}
      >
        {["Show Rows", "Copy", "CSV", "Excel", "PDF", "Print"].map((label) => (
          <Button key={label} variant="outlined" size="small">
            {label}
          </Button>
        ))}
      </Box>

      {/* Loading or Error */}
      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Loading categories...</Typography>
        </Box>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* DataGrid */}
      <Box sx={{ height: 400, width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={filteredCategory}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
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

export default Category;
