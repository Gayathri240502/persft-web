"use client";

import React from "react";
import { 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Paper, Typography, IconButton 
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blue } from "@mui/material/colors";

const AttributeGroupsPage: React.FC = () => {
  const rows = [
    {
      id: 1,
      name: "Color Group",
      description: "Group for all color-related attributes.",
      listOrders: "First",
      addedBy: "Admin",
    },
    {
      id: 2,
      name: "Size Group",
      description: "Group for all size-related attributes.",
      listOrders: "Second",
      addedBy: "Manager",
    },
    {
      id: 3,
      name: "Material Group",
      description: "Group for all material-related attributes.",
      listOrders: "Third",
      addedBy: "Admin",
    },
    {
      id: 4,
      name: "Brand Group",
      description: "Group for all brand-related attributes.",
      listOrders: "Fourth",
      addedBy: "Manager",
    },
    {
      id: 5,
      name: "Warranty Group",
      description: "Group for all warranty-related attributes.",
      listOrders: "Fifth",
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
        <Typography variant="h4" style={{ color: "#05344c" }}>Attribute Groups</Typography>
        <Button variant="contained" href="attributes-groups/add" style={{ backgroundColor: "#05344c", color: "white" }}>
          Add Attribute Group
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

export default AttributeGroupsPage;
