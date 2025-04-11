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
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Interface for each category
interface Category {
  _id?: string;
  name: string;
  description: string;
  thumbnail: string;
  archive: boolean;
  id?: string;
  sn?: number;
}

// Column definitions for DataGrid
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

const Category = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category[]>([]);
  const { token } = getTokenAndRole();

  // Fetch categories from API
  const fetchCategory = async () => {
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

      const result = await response.json();
      console.log("Fetched categories:", result);

      // ✅ Correct key: result.categories
      if (Array.isArray(result.categories)) {
        const categoryWithExtras = result.categories.map((item, index) => ({
          ...item,
          id: item._id,
          sn: index + 1,
        }));
        setCategory(categoryWithExtras);
      } else {
        console.error("Invalid category data format:", result);
        setCategory([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategory([]);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  // Filtered data based on search
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

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Category
      </Typography>

      {/* Search and Add Button */}
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

      {/* Export Buttons - Placeholder */}
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

      {/* Data Grid */}
      <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
        <DataGrid
          columns={columns}
          rows={filteredCategory}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              fontSize: isSmallScreen ? "0.8rem" : "1rem",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Category;
