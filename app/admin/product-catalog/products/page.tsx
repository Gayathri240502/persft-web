"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import {
  GridColDef,
  GridCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

// Interfaces
export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
export interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  brand: string;
  modelName: string;
  coohomId: string;
  description: string;
  category: Category;
  subCategory: SubCategory;
  workGroup: WorkGroup;
  workTask: WorkTask;
  attributeValues: AttributeValue[];
  sn?: number;
  id?: string;
}
interface Category {
  _id: string;
  name: string;
}
interface SubCategory {
  _id: string;
  name: string;
}
interface WorkGroup {
  _id: string;
  name: string;
}
interface WorkTask {
  _id: string;
  name: string;
}
interface AttributeValue {
  attribute: Attribute;
  value: string;
}
interface Attribute {
  _id: string;
  name: string;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Products = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [products, setProducts] = useState<Product[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { token } = getTokenAndRole();
  const debouncedSearch = useDebounce(search, 300);

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "sku", headerName: "SKU", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "brand", headerName: "Brand", flex: 1 },
    { field: "modelName", headerName: "Model Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridCellParams) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() =>
              router.push(`/admin/product-catalog/products/${params.row._id}`)
            }
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/admin/product-catalog/products/edit?id=${params.row._id}`
              )
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row._id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchProducts = async () => {
    if (!token) return;

    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: debouncedSearch,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch products");

      const data: ProductResponse = await res.json();

      const formattedProducts = data.products.map((item, index) => ({
        ...item,
        id: item._id,
        sn: page * pageSize + index + 1,
      }));

      setProducts(formattedProducts);
      setRowCount(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [paginationModel, debouncedSearch, token]);

  useEffect(() => {
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [debouncedSearch]);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const handleAdd = () => {
    router.push("/admin/product-catalog/products/add");
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId || !token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete product");

      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <>
      <Navbar label="Products" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        <Box sx={{ height: 600, width: "100%" }}>
          <StyledDataGrid
            rows={products}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 100]}
            paginationMode="server"
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchPlaceholder="Search Products..."
            addButtonText="Add Product"
            getRowId={(row) => row.id}
          />
        </Box>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}

        {!loading && products.length === 0 && (
          <Typography mt={2}>No products found.</Typography>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this product?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Products;
