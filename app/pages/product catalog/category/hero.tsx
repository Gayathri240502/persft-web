'use client'

import React from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Typography, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blue } from "@mui/material/colors";

const CategoryPage = () => {
  const rows = [
    {
      id: 1,
      name: "Modern Villa",
      description: "Luxurious villa with a swimming pool.",
      type: "Luxury",
      addedBy: "Admin",
    },
    {
      id: 2,
      name: "Country Cottage",
      description: "Cozy cottage in the countryside.",
      type: "Classic",
      addedBy: "Manager",
    },
    {
      id: 3,
      name: "Urban Apartment",
      description: "Stylish apartment in the city center.",
      type: "Modern",
      addedBy: "Admin",
    },
    {
      id: 4,
      name: "Beach House",
      description: "Beautiful house by the beach.",
      type: "Luxury",
      addedBy: "Admin",
    },
    {
      id: 5,
      name: "Mountain Cabin",
      description: "Rustic cabin with breathtaking views.",
      type: "Rustic",
      addedBy: "Manager",
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
        <Typography variant="h4" style={{ color: "#05344c" }}>Category</Typography>
        <div>
          <Button variant="contained" style={{ backgroundColor: "#05344c", color: "white", marginRight: "8px" }}>CVV Import</Button>
          <Button variant="contained" href="category/add" style={{ backgroundColor: "#4caf50", color: "white" }}>Add Category</Button>
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
              <TableCell style={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
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
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
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

export default CategoryPage;