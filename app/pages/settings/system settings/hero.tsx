"use client";

import React, { useState } from "react";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
const SystemSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rows = [
    { id: 1, name: "Max Upload Size", value: "10 MB", status: "Active" },
    { id: 2, name: "Max Session Timeout", value: "30 minutes", status: "Active" },
    { id: 3, name: "Timezone", value: "UTC", status: "Inactive" },
    { id: 4, name: "Currency", value: "USD", status: "Active" },
    { id: 5, name: "Language", value: "English", status: "Active" },
  ];

  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const handleCopy = () => {
  //   const tableContent = filteredRows
  //     .map((row, index) => `${index + 1}. ${row.name} - ${row.value} - ${row.status}`)
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

  // Handle pagination changes
      const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#05344c' }}>System Settings</h1>
        <Button variant="contained" color="primary" style={{ backgroundColor: '#05344c' }}>
          Add Setting
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <TextField
          variant="outlined"
          fullWidth
          label="Search by Setting Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button variant="contained" color="secondary" size="small"  style={{ backgroundColor: '#05344c' }}>
          Copy
        </Button>
        <Button variant="contained" color="secondary" size="small"  style={{ backgroundColor: '#05344c' }}>
          CSV
        </Button>
        <Button variant="contained" color="secondary" size="small"  style={{ backgroundColor: '#05344c' }}>
          Excel
        </Button>
        <Button variant="contained" color="secondary" size="small"  style={{ backgroundColor: '#05344c' }}>
          PDF
        </Button>
        <Button variant="contained" color="secondary" size="small"  style={{ backgroundColor: '#05344c' }}>
          Print
        </Button>
      </div>

      {/* Table Section */}
      <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
        <Table id="table-to-print" style={{ minWidth: '650px' }}>
          <TableHead style={{ backgroundColor: '#05344c' }}>
            <TableRow>
              <TableCell style={{ color: '#fff', fontWeight: '600' }}>S.No</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: '600' }}>Setting Name</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: '600' }}>Value</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: '600' }}>Status</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: '600' }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.value}</TableCell>
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

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default SystemSettings;
