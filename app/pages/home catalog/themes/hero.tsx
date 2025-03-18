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

const Themes: React.FC = () => {
  const [rows, ] = useState([
    {
      id: 1,
      name: "Modern Minimalist",
      group: "Contemporary",
      createdBy: "Admin",
      date: "2025-01-21",
    },
    {
      id: 2,
      name: "Rustic Charm",
      group: "Traditional",
      createdBy: "Designer",
      date: "2025-01-20",
    },
    {
      id: 3,
      name: "Industrial Loft",
      group: "Urban",
      createdBy: "Architect",
      date: "2025-01-19",
    },
    {
      id: 4,
      name: "Coastal Breeze",
      group: "Beach",
      createdBy: "Admin",
      date: "2025-01-18",
    },
    {
      id: 5,
      name: "Vintage Elegance",
      group: "Classic",
      createdBy: "Manager",
      date: "2025-01-17",
    },
  ]);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

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
          Themes
        </Typography>
        <Button variant="contained" href="themes/add" style={{ backgroundColor: "#05344c", color: "white" }}>
          Add
        </Button>
      </div>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#05344c" }}>
              <TableCell style={{ color: "white" }}>S.No</TableCell>
              <TableCell style={{ color: "white" }}>ID</TableCell>
              <TableCell style={{ color: "white" }}>Name</TableCell>
              <TableCell style={{ color: "white" }}>Group</TableCell>
              <TableCell style={{ color: "white" }}>Created By</TableCell>
              <TableCell style={{ color: "white" }}>Date</TableCell>
              <TableCell style={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.group}</TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit" style={{ color: "#388e3c" }}>
                    <Edit />
                  </IconButton>
                  <IconButton aria-label="delete" style={{ color: "#d32f2f", marginLeft: "8px" }}>
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

export default Themes;
