"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import ReusableButton from "@/app/components/Button";
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

  const columns: GridColDef[] = [
    { field: "sn", headerName: "SN", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "sku", headerName: "SKU", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "brand", headerName: "Brand", flex: 1 },
    { field: "modelName", headerName: "Model Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    // {
    //   field: "category",
    //   headerName: "Category",
    //   flex: 1,
    //   valueGetter: (params) => params?.row?.category?.name ?? "",
    // },
    // {
    //   field: "subCategory",
    //   headerName: "SubCategory",
    //   flex: 1,
    //   valueGetter: (params) => params?.row?.subCategory?.name ?? "",
    // },
    // {
    //   field: "workGroup",
    //   headerName: "Work Group",
    //   flex: 1,
    //   valueGetter: (params) => params?.row?.workGroup?.name ?? "",
    // },
    // {
    //   field: "workTask",
    //   headerName: "Work Task",
    //   flex: 1,
    //   valueGetter: (params) => params?.row?.workTask?.name ?? "",
    // },
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
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
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
    fetchProducts();
  }, [paginationModel, search]);

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;
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
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Products
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
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
          onClick={() => router.push("/admin/product-catalog/products/add")}
        >
          ADD
        </ReusableButton>
      </Box>

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
        />
      </Box>
    </Box>
  );
};

export default Products;
