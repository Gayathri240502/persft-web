"use client";

import React, { useState } from "react";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination ,IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
const LanguageSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rows = [
    { id: 1, name: "English", code: "EN", status: "Active" },
    { id: 2, name: "Spanish", code: "ES", status: "Active" },
    { id: 3, name: "French", code: "FR", status: "Inactive" },
    { id: 4, name: "German", code: "DE", status: "Active" },
    { id: 5, name: "Italian", code: "IT", status: "Inactive" },
    { id: 6, name: "Portuguese", code: "PT", status: "Active" },
    { id: 7, name: "Dutch", code: "NL", status: "Active" },
    { id: 8, name: "Russian", code: "RU", status: "Inactive" },
    { id: 9, name: "Chinese", code: "CN", status: "Active" },
    { id: 10, name: "Japanese", code: "JP", status: "Inactive" },
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
  //     .map((row, index) => `${index + 1}. ${row.name} - ${row.code} - ${row.status}`)
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
    <div style={{ padding: "16px", backgroundColor: "#f1f1f1", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#05344c", fontWeight: "600", fontSize: "24px" }}>Language Settings</h1>
        <Button variant="contained" style={{ backgroundColor: "#05344c", color: "#fff" }}>
          Add Language
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "16px" }}>
        <TextField
          label="Search by Language Name"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ backgroundColor: "#fff" }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <Button variant="outlined"  style={{ color: "#05344c" }}>
          Copy
        </Button>
        <Button variant="outlined"  style={{ color: "#05344c" }}>
          CSV
        </Button>
        <Button variant="outlined"  style={{ color: "#05344c" }}>
          Excel
        </Button>
        <Button variant="outlined"  style={{ color: "#05344c" }}>
          PDF
        </Button>
        <Button variant="outlined"  style={{ color: "#05344c" }}>
          Print
        </Button>
      </div>

      {/* Table Section */}
      <TableContainer component={Paper} id="table-to-print" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
        <Table>
          <TableHead style={{ backgroundColor: "#05344c" }}>
            <TableRow>
              <TableCell style={{ color: "#fff" }}>S.No</TableCell>
              <TableCell style={{ color: "#fff" }}>Language Name</TableCell>
              <TableCell style={{ color: "#fff" }}>Code</TableCell>
              <TableCell style={{ color: "#fff" }}>Status</TableCell>
              <TableCell style={{ color: "#fff" }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                  <IconButton color="primary" size="small"><EditIcon /></IconButton>
                  <IconButton color="error" size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination */}
      <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          style={{ color: "#05344c" }}
        />
      </div>
    </div>
  );
};

export default LanguageSettings;
