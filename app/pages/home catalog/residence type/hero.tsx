"use client";

import React, { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const ResidenceTypes: React.FC = () => {
  const [rows,] = useState([
    {
      id: 1,
      name: "Modern Villa",
      description: "Luxurious villa with a swimming pool.",
      category: "Luxury",
      type: "Residential",
      status: "Available",
      price: "$500,000",
      createdDate: "2025-01-21",
    },
    {
      id: 2,
      name: "Country Cottage",
      description: "Cozy cottage in the countryside.",
      category: "Classic",
      type: "Residential",
      status: "Unavailable",
      price: "$300,000",
      createdDate: "2025-01-20",
    },
  ]);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Handle pagination changes
  const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ padding: "16px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Residence Types
        </Typography>
        <Button variant="contained" href="residence-types/add" style={{ backgroundColor: "#05344c", color: "white" }}>
          Add
        </Button>
      </div>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#05344c" }}>
              <TableCell style={{ color: "white" }}>S.No</TableCell>
              <TableCell style={{ color: "white" }}>Name</TableCell>
              <TableCell style={{ color: "white" }}>Description</TableCell>
              <TableCell style={{ color: "white" }}>Category</TableCell>
              <TableCell style={{ color: "white" }}>Type</TableCell>
              <TableCell style={{ color: "white" }}>Status</TableCell>
              <TableCell style={{ color: "white" }}>Price</TableCell>
              <TableCell style={{ color: "white" }}>Created Date</TableCell>
              <TableCell style={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>
                  <IconButton style={{ color: "#05344c" }}>
                    <Edit />
                  </IconButton>
                  <IconButton style={{ color: "#d32f2f" }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default ResidenceTypes;
