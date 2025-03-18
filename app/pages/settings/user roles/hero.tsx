"use client";

import React, { useState } from "react";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  IconButton
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const UserRoleSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rows = [
    { id: 1, name: "Admin", users: "20", type: "System", roleLevel: "1" },
    { id: 2, name: "Editor", users: "15", type: "Content", roleLevel: "2" },
    { id: 3, name: "Viewer", users: "50", type: "Read-Only", roleLevel: "3" },
    { id: 4, name: "Manager", users: "8", type: "Team", roleLevel: "1" },
    { id: 5, name: "Moderator", users: "12", type: "Content", roleLevel: "2" },
  ];

  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle pagination changes
      const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

  // const handleCopy = () => {
  //   const tableContent = filteredRows
  //     .map((row, index) => `${index + 1}. ${row.name} - ${row.users} users`)
  //     .join("\n");
  //   navigator.clipboard.writeText(tableContent);
  // };

  // const handlePrint = () => {
  //   const printContent = document.getElementById("table-to-print");
  //   const newWindow = window.open();
  //   newWindow.document.write(printContent.innerHTML);
  //   newWindow.print();
  // };

  // const handleCSV = () => {
  //   console.log("CSV export triggered");
  // };

  // const handleExcel = () => {
  //   console.log("Excel export triggered");
  // };

  // const handlePDF = () => {
  //   console.log("PDF export triggered");
  // };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#05344c" }}>User Role Settings</h1>
        <Button variant="contained" color="primary" style={{ backgroundColor: "#05344c" }}>
          Add Role
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "16px" }}>
        <TextField
          label="Search by Role Name"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <Button variant="outlined"  style={{ backgroundColor: "#f0f0f0" }}>
          Copy
        </Button>
        <Button variant="outlined"  style={{ backgroundColor: "#f0f0f0" }}>
          CSV
        </Button>
        <Button variant="outlined"  style={{ backgroundColor: "#f0f0f0" }}>
          Excel
        </Button>
        <Button variant="outlined"  style={{ backgroundColor: "#f0f0f0" }}>
          PDF
        </Button>
        <Button variant="outlined"  style={{ backgroundColor: "#f0f0f0" }}>
          Print
        </Button>
      </div>

      {/* Table Section */}
      <Paper elevation={3} style={{ padding: "16px", backgroundColor: "#fff" }} id="table-to-print">
        <TableContainer>
          <Table>
            <TableHead style={{ backgroundColor: "#05344c", color: "white" }}>
              <TableRow>
                <TableCell style={{ color: "white" }}>S.No</TableCell>
                <TableCell style={{ color: "white" }}>Name</TableCell>
                <TableCell style={{ color: "white" }}>Users</TableCell>
                <TableCell style={{ color: "white" }}>Type</TableCell>
                <TableCell style={{ color: "white" }}>Role Level</TableCell>
                <TableCell style={{ color: "white" }}>Option</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow hover key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.users}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.roleLevel}</TableCell>
                  <TableCell>
                  <IconButton color="primary" size="small"><EditIcon /></IconButton>
                  <IconButton color="error" size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination Section */}
      <TablePagination
        component="div"
        count={filteredRows.length}
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

export default UserRoleSettings;
