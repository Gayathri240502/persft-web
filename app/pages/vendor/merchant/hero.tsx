"use client"

import React from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blue } from "@mui/material/colors";

const MerchantPage = () => {
  const rows = [
    {
      id: 1,
      name: "Merchant 1",
      description: "Popular merchant with various products.",
      type: "Wholesale",
      addedBy: "Admin",
      image: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      name: "Merchant 2",
      description: "Specializes in electronics and gadgets.",
      type: "Retail",
      addedBy: "Manager",
      image: "https://via.placeholder.com/50",
    },
    {
      id: 3,
      name: "Merchant 3",
      description: "Sells high-end fashion items.",
      type: "Premium",
      addedBy: "Admin",
      image: "https://via.placeholder.com/50",
    },
    {
      id: 4,
      name: "Merchant 4",
      description: "A variety of home decor products.",
      type: "Retail",
      addedBy: "Admin",
      image: "https://via.placeholder.com/50",
    },
    {
      id: 5,
      name: "Merchant 5",
      description: "Leading online store for gadgets.",
      type: "Wholesale",
      addedBy: "Manager",
      image: "https://via.placeholder.com/50",
    },
  ];

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);

  // Fix TypeScript error by explicitly defining event types
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ padding: "16px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Typography variant="h4" style={{ color: "#05344c" }}>Merchants</Typography>
        <Button variant="contained" href="merchants/add" style={{ backgroundColor: "#05344c", color: "white" }}>
          Add Merchant
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
              <TableCell style={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Added By</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Option</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.addedBy}</TableCell>
                <TableCell>
                  <IconButton style={{ color: blue[500] }}><EditIcon /></IconButton>
                  <IconButton style={{ color: "red" }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={rows.length}
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

export default MerchantPage;
