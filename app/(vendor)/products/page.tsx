"use client";
import React, { useState, useCallback, useEffect } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  useMediaQuery,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { GetApp as DownloadIcon } from "@mui/icons-material";

interface Product {
  productId: string;
  productName: string;
  obsBrandGoodId: string;
  coohomId: string;
  workGroupName: string;
  workTaskName: string;
  targetDays: number;
  bufferDays: number;
  poDays: number;
  assignedAt: string;
  assignedByName: string;
  poStatus: string;
  poAvailable: boolean;
  id?: string;
  sn?: number;
  workOrderId?: string;
}

// debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const Products = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useTokenAndRole();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    const { page, pageSize } = paginationModel;
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });
      if (debouncedSearch.trim()) {
        queryParams.append("searchTerm", debouncedSearch.trim());
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/products?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch products.");

      const data = await res.json();

      if (Array.isArray(data.products)) {
        const mapped = data.products.map((p: Product, idx: number) => ({
          ...p,
          id: `${p.workOrderId}_${p.productId}`, // unique ID
          sn: page * pageSize + idx + 1,
        }));
        setProducts(mapped);
        setRowCount(data.total || 0);
      } else {
        setProducts([]);
        setRowCount(0);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [paginationModel, debouncedSearch]);

  const handleSearchChange = useCallback((val: string) => setSearch(val), []);

  const handleDownloadPO = async (productId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/po/${productId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to download PO");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO_${productId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Download failed.");
    }
  };

  const Columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 50 },
    { field: "productName", headerName: "Product Name", flex: 1 },
    { field: "obsBrandGoodId", headerName: "OBS ID", flex: 1 },
    { field: "workGroupName", headerName: "Work Group", flex: 1 },
    { field: "workTaskName", headerName: "Work Task", flex: 1 },
    { field: "targetDays", headerName: "Target Days", flex: 0.5 },
    { field: "bufferDays", headerName: "Buffer Days", flex: 0.5 },
    { field: "poDays", headerName: "PO Days", flex: 0.5 },
    { field: "poStatus", headerName: "PO Status", flex: 1 },
    {
      field: "poAvailable",
      headerName: "PO Available",
      flex: 1,
      renderCell: (params) =>
        params.row.poAvailable && params.row.poStatus === "generated" ? (
          <IconButton
            size="small"
            onClick={() => handleDownloadPO(params.row.productId)}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        ) : (
          "No"
        ),
    },
  ];

  return (
    <>
      <Navbar label="Products" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ height: 600, width: "100%", position: "relative" }}>
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
            columns={Columns}
            rows={products}
            rowCount={rowCount}
            pagination
            disableAllSorting
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            autoHeight
            disableColumnMenu={isSmallScreen}
            loading={loading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Box>
      </Box>
    </>
  );
};

export default Products;
