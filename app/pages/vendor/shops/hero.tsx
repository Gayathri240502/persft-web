"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Typography,
  CssBaseline,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { blue } from "@mui/material/colors";
import Image from "next/image";

// Define the type for a shop
interface Shop {
  id: number;
  name: string;
  description: string;
  location: string;
  owner: string;
  image: string;
}

const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Simulating data fetching to prevent SSR hydration errors
  useEffect(() => {
    setShops([
      {
        id: 1,
        name: "Shop 1",
        description: "A popular local shop selling a variety of products.",
        location: "Downtown",
        owner: "John Doe",
        image: "https://via.placeholder.com/50",
      },
      {
        id: 2,
        name: "Shop 2",
        description: "Shop specializing in handmade crafts.",
        location: "Main Street",
        owner: "Jane Smith",
        image: "https://via.placeholder.com/50",
      },
      {
        id: 3,
        name: "Shop 3",
        description: "A trendy clothing boutique.",
        location: "Uptown",
        owner: "Sarah Lee",
        image: "https://via.placeholder.com/50",
      },
      {
        id: 4,
        name: "Shop 4",
        description: "Offers a wide range of electronic gadgets.",
        location: "City Center",
        owner: "James Bond",
        image: "https://via.placeholder.com/50",
      },
      {
        id: 5,
        name: "Shop 5",
        description: "Bookstore offering a variety of genres.",
        location: "North Avenue",
        owner: "Emily Davis",
        image: "https://via.placeholder.com/50",
      },
    ]);
  }, []);

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <CssBaseline />
      <div style={{ padding: "16px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Typography variant="h4" style={{ color: "#05344c" }}>Shops</Typography>
          <Button variant="contained" href="shops/add" style={{ backgroundColor: "#05344c", color: "white" }}>
            Add Shop
          </Button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {["Show Rows", "Copy", "CSV", "Excel", "PDF", "Print"].map((action, index) => (
            <Button key={index} variant="outlined" size="small" style={{ color: "#05344c", borderColor: "#05344c" }}>
              {action}
            </Button>
          ))}
        </div>

        {/* Table Section */}
        <TableContainer component={Paper} style={{ backgroundColor: "white", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <Table>
            <TableHead style={{ backgroundColor: "#05344c" }}>
              <TableRow>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Avatar</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Location</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Owner</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shops.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((shop, index) => (
                <TableRow key={shop.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{shop.name}</TableCell>
                  <TableCell>
                    <Image
                      src={shop.image}
                      alt={shop.name}
                      width={50}
                      height={50}
                      unoptimized // Fixes Next.js hydration issues
                      className="rounded object-cover"
                    />
                  </TableCell>
                  <TableCell>{shop.description}</TableCell>
                  <TableCell>{shop.location}</TableCell>
                  <TableCell>{shop.owner}</TableCell>
                  <TableCell>
                    <IconButton style={{ color: blue[500] }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton style={{ color: "red" }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={shops.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", color: "#05344c" }}
        />
      </div>
    </>
  );
};

export default ShopsPage;
