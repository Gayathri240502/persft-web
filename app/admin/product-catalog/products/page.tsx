"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// Industry standard debounce hook with proper cleanup and type safety
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Create a timeout to update the debounced value
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to prevent memory leaks and cancel pending timeouts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for API calls with proper error handling and abort controller
const useProductsAPI = () => {
  const { token } = getTokenAndRole();

  const fetchProducts = useCallback(
    async (
      page: number,
      pageSize: number,
      searchTerm: string,
      abortController?: AbortController
    ): Promise<ProductResponse> => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const queryParams = new URLSearchParams({
        page: String(page + 1), // API expects 1-based pagination
        limit: String(pageSize),
        searchTerm: searchTerm.trim(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: abortController?.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    },
    [token]
  );

  const deleteProduct = useCallback(
    async (productId: string): Promise<void> => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete product: ${response.status} ${response.statusText}`
        );
      }
    },
    [token]
  );

  return { fetchProducts, deleteProduct };
};

const Products = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { fetchProducts, deleteProduct } = useProductsAPI();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Debounced search with industry standard delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized columns definition to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "sn",
        headerName: "SN",
        width: 70,
        sortable: false,
      },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "sku",
        headerName: "SKU",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "price",
        headerName: "Price",
        flex: 1,
        minWidth: 100,
        valueFormatter: (params) => {
          if (typeof params.value === "number") {
            return `$${params.value.toFixed(2)}`;
          }
          return params.value;
        },
      },
      {
        field: "brand",
        headerName: "Brand",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "modelName",
        headerName: "Model Name",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        minWidth: 200,
      },
      {
        field: "action",
        headerName: "Actions",
        flex: 1,
        minWidth: 120,
        sortable: false,
        filterable: false,
        disableExport: true,
        renderCell: (params: GridCellParams) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              color="info"
              size="small"
              onClick={() => handleViewClick(params.row._id)}
              aria-label="View product"
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditClick(params.row._id)}
              aria-label="Edit product"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteClick(params.row._id)}
              aria-label="Delete product"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  // Memoized action handlers to prevent unnecessary re-renders
  const handleViewClick = useCallback(
    (productId: string) => {
      router.push(`/admin/product-catalog/products/${productId}`);
    },
    [router]
  );

  const handleEditClick = useCallback(
    (productId: string) => {
      router.push(`/admin/product-catalog/products/edit?id=${productId}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((productId: string) => {
    setSelectedDeleteId(productId);
    setDeleteDialogOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/admin/product-catalog/products/add");
  }, [router]);

  // Search handler with proper debouncing
  const handleSearchChange = useCallback((searchValue: string) => {
    setSearchTerm(searchValue);
    // Reset to first page when search changes
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, []);

  // Main data fetching function with abort controller for cleanup
  const loadProducts = useCallback(async () => {
    const abortController = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProducts(
        paginationModel.page,
        paginationModel.pageSize,
        debouncedSearchTerm,
        abortController
      );

      // Format products with serial numbers
      const formattedProducts = data.products.map((item, index) => ({
        ...item,
        id: item._id,
        sn: paginationModel.page * paginationModel.pageSize + index + 1,
      }));

      setProducts(formattedProducts);
      setRowCount(data.total);
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
        console.error("Error fetching products:", err);
      }
    } finally {
      setLoading(false);
    }

    // Return cleanup function
    return () => {
      abortController.abort();
    };
  }, [
    fetchProducts,
    paginationModel.page,
    paginationModel.pageSize,
    debouncedSearchTerm,
  ]);

  // Effect for loading products with proper cleanup
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const load = async () => {
      cleanup = await loadProducts();
    };

    load();

    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [loadProducts]);

  // Delete confirmation handler
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedDeleteId) return;

    try {
      setLoading(true);
      await deleteProduct(selectedDeleteId);

      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);

      // Reload products
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDeleteId, deleteProduct, loadProducts]);

  // Dialog handlers
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  }, []);

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
            pageSizeOptions={[5, 10, 25, 50, 100]}
            paginationMode="server"
            onAdd={handleAdd}
            onSearch={handleSearchChange}
            searchValue={searchTerm}
            searchPlaceholder="Search products..."
            addButtonText="Add Product"
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-row:hover": {
                cursor: "default",
              },
            }}
          />
        </Box>

        {/* Error display */}
        {error && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mt: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}
          >
            Error: {error}
          </Typography>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && !error && (
          <Typography
            variant="body1"
            sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
          >
            {debouncedSearchTerm
              ? "No products found matching your search."
              : "No products available."}
          </Typography>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={loading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Products;
