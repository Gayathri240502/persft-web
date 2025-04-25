"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import ReusableButton from "@/app/components/Button";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";

interface Merchant {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  archive: boolean;
  businessName: string;
  address: string;
  category: string;
  subCategory: string;
  categoryName: string;
  subCategoryName: string;
}

interface MerchantResponse {
  merchants: Merchant[];
  total: number;
}

const Merchant = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = getTokenAndRole();

  const fetchMerchants = async () => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/merchants?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }

      const result: MerchantResponse = await response.json();
      if (Array.isArray(result.merchants)) {
        const dataWithSN = result.merchants.map((merchant, index) => ({
          ...merchant,
          id: merchant._id,
          sn: page * pageSize + index + 1,
        }));
        setRows(dataWithSN);
        setRowCount(result.total || dataWithSN.length);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [paginationModel, search]);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", flex: 0.4 },
    { field: "firstName", headerName: "First Name", flex: 0.8 },
    { field: "lastName", headerName: "Last Name", flex: 0.8 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.2 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "businessName", headerName: "Business Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1.5 },
    {
      field: "enabled",
      headerName: "Enabled",
      flex: 0.5,
      type: "boolean",
    },
    
    {
      field: "action",
      headerName: "Action",
      flex: 0.8,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" size="small"
          onClick={() =>
            router.push(
              `/admin/vendors/merchants/${params.row.id}`
            )
          }>
            <Visibility/>
          </IconButton>
          <IconButton color="primary" size="small"
          onClick={() =>
            router.push(
              `/admin/vendors/merchants/edit?id=${params.row.id}`
            )
          }>
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
        Merchants
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
          onClick={() => router.push("/admin/vendors/merchants/add")}
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
        <StyledDataGrid
          columns={columns}
          rows={rows}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableColumnMenu={isSmallScreen}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Merchant;
