"use client";

import React from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Typography, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blue } from "@mui/material/colors";

const ProductsPage = () => {
  const products = [
    {
      id: 1,
      name: "Laptop",
      description: "High-performance laptop for work and gaming.",
      type: "Electronics",
      addedBy: "Admin",
    },
    {
      id: 2,
      name: "Running Shoes",
      description: "Comfortable running shoes for daily use.",
      type: "Footwear",
      addedBy: "Manager",
    },
    {
      id: 3,
      name: "Smartphone",
      description: "Latest model smartphone with advanced features.",
      type: "Electronics",
      addedBy: "Admin",
    },
    {
      id: 4,
      name: "Backpack",
      description: "Durable and spacious backpack for travel.",
      type: "Accessories",
      addedBy: "Manager",
    },
    {
      id: 5,
      name: "Coffee Maker",
      description: "Automatic coffee maker with multiple brewing options.",
      type: "Appliances",
      addedBy: "Admin",
    },
  ];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Handle pagination changes
      const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

  return (
    <div style={{ padding: "16px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Typography variant="h4" style={{ color: "#05344c" }}>Products</Typography>
        <div>
          <Button variant="contained" style={{ backgroundColor: "#05344c", color: "white", marginRight: "8px" }}>CSV Import</Button>
          <Button variant="contained" href="products/add" style={{ backgroundColor: "#4caf50", color: "white" }}>Add Product</Button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["Show Rows", "Copy", "CSV", "Excel", "PDF", "Print"].map((action, index) => (
          <Button key={index} variant="outlined" size="small" style={{ color: "#05344c", borderColor: "#05344c" }}>
            {action}
          </Button>
        ))}
      </div>

      <TableContainer component={Paper} style={{ backgroundColor: "white", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <Table>
          <TableHead style={{ backgroundColor: "#05344c" }}>
            <TableRow>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Added By</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Option</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product, index) => (
              <TableRow key={product.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.addedBy}</TableCell>
                <TableCell>
                  <IconButton style={{ color: blue[500] }}><EditIcon /></IconButton>
                  <IconButton style={{ color: "red" }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={products.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", color: "#05344c" }}
      />
    </div>
  );
};

export default ProductsPage;
