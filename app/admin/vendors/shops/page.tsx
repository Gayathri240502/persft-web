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
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Shop {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  archive: boolean;
  ownerName: string;
}

interface ShopResponse {
  shops: Shop[];
  total: number;
}

const Shop = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = getTokenAndRole();

  const fetchShops = async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shops");
      }

      const result: ShopResponse = await response.json();

      if (Array.isArray(result.shops)) {
        const dataWithSN = result.shops.map((shop, index) => ({
          ...shop,
          id: shop._id,
          sn: page * pageSize + index + 1,
        }));

        setRows(dataWithSN);
        setRowCount(result.total || dataWithSN.length);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [paginationModel, search]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.3 },
    { field: "firstName", headerName: "First Name", flex: 0.8 },
    { field: "lastName", headerName: "Last Name", flex: 0.8 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.2 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "ownerName", headerName: "Owner Name", flex: 1 },
    { field: "enabled", headerName: "Enabled", type: "boolean", flex: 0.5 },
    { field: "archive", headerName: "Archived", type: "boolean", flex: 0.5 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.8,
      renderCell: () => (
        <Box display="flex" gap={1}>
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
        Shop
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
        <ReusableButton onClick={() => router.push("/admin/vendors/shops/add")}>
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
        {["Show Rows", "Copy", "CSV", "Excel", "PDF", "Print"].map((label) => (
          <Button key={label} variant="outlined" size="small">
            {label}
          </Button>
        ))}
      </Box>

      <Box sx={{ minHeight: 400, width: "99%", overflowX: "auto" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <DataGrid
            columns={columns}
            rows={rows}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCount}
            paginationMode="server"
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            sx={{
              borderRadius: 2,
              boxShadow: 1,
              "& .MuiDataGrid-columnHeaders": {
                fontSize: isSmallScreen ? "0.8rem" : "1rem",
                backgroundColor: "#f0f0f0",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "#f9f9f9",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#ffffff",
              },
              "& .MuiDataGrid-cell": {
                fontSize: isSmallScreen ? "0.75rem" : "0.9rem",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Shop;
