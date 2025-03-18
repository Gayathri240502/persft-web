"use client";

import React from "react";
import { 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Paper, Typography, IconButton 
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blue } from "@mui/material/colors";

const AttributesPage: React.FC = () => {
  const rows = [
    {
      id: 1,
      name: "Color",
      description: "Defines the color attribute for products.",
      listOrders: "First",
      type: "Dropdown",
      addedBy: "Admin",
    },
    {
      id: 2,
      name: "Size",
      description: "Defines the size attribute for products.",
      listOrders: "Second",
      type: "Radio",
      addedBy: "Manager",
    },
    {
      id: 3,
      name: "Material",
      description: "Defines the material used in products.",
      listOrders: "Third",
      type: "Checkbox",
      addedBy: "Admin",
    },
    {
      id: 4,
      name: "Brand",
      description: "Defines the brand of the product.",
      listOrders: "Fourth",
      type: "Dropdown",
      addedBy: "Manager",
    },
    {
      id: 5,
      name: "Warranty",
      description: "Defines the warranty period for the product.",
      listOrders: "Fifth",
      type: "Text",
      addedBy: "Admin",
    },
  ];

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);

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
        <Typography variant="h4" style={{ color: "#05344c" }}>Attributes</Typography>
        <Button variant="contained" href="attributes/add" style={{ backgroundColor: "#05344c", color: "white" }}>
          Add Attribute
        </Button>
      </div>

      <TableContainer component={Paper} style={{ backgroundColor: "white", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <Table>
          <TableHead style={{ backgroundColor: "#05344c" }}>
            <TableRow>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>List Orders</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.listOrders}</TableCell>
                <TableCell>{row.type}</TableCell>
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

export default AttributesPage;
