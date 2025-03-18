"use client";

import React from "react";
import { FaFilter, FaPlus, FaDownload, FaUpload, FaRedo, FaEye, FaEdit, FaTrash } from "react-icons/fa"; // Importing required icons
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";

const AddNewProjectPage = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const projects = [
    {
      id: 1,
      name: "Modern Villa",
      uniqueId: "ABC123",
      createdAt: "2025-01-01",
      status: "Active",
    },
    {
      id: 2,
      name: "Country Cottage",
      uniqueId: "XYZ456",
      createdAt: "2025-01-05",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Urban Apartment",
      uniqueId: "LMN789",
      createdAt: "2025-01-10",
      status: "Active",
    },
    // Add more projects as needed
  ];

  const filteredRows = projects; // Use any filtering logic if needed

  // Handle pagination changes
      const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };
  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#05344c" }}>Projects</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Left Side: Bulk Action Dropdown and Filter */}
          <FormControl variant="outlined" size="small" style={{ minWidth: "150px" }}>
            <InputLabel>Bulk Action</InputLabel>
            <Select defaultValue="bulk-action">
              <MenuItem value="bulk-action">Bulk Action</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
              <MenuItem value="archive">Archive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" color="primary" size="small" startIcon={<FaFilter />} style={{ textTransform: "none" }}>
            Filters
          </Button>
        </div>

        {/* Right Side: Search Bar and Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <TextField variant="outlined" size="small" placeholder="Search Projects" style={{ width: "200px" }} />
          <Button variant="contained" color="primary" size="small" startIcon={<FaPlus />} style={{ textTransform: "none" }}>
            Create
          </Button>
          <Button variant="contained" color="success" size="small" startIcon={<FaUpload />} style={{ textTransform: "none" }}>
            Import Project
          </Button>
          <Button variant="contained" color="warning" size="small" startIcon={<FaDownload />} style={{ textTransform: "none" }}>
            Export Project
          </Button>
          <Button variant="contained" color="error" size="small" startIcon={<FaRedo />} style={{ textTransform: "none" }}>
            Reload
          </Button>
        </div>
      </div>

      {/* Projects Table Section */}
      <TableContainer style={{ backgroundColor: "#fff", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "8px", padding: "20px" }}>
        <Table>
          <TableHead style={{ backgroundColor: "#05344c", color: "#fff" }}>
            <TableRow>
              <TableCell style={{ color: "#fff" }}>S.No</TableCell>
              <TableCell style={{ color: "#fff" }}>ID</TableCell>
              <TableCell style={{ color: "#fff" }}>Name</TableCell>
              <TableCell style={{ color: "#fff" }}>View</TableCell>
              <TableCell style={{ color: "#fff" }}>Unique ID</TableCell>
              <TableCell style={{ color: "#fff" }}>Created At</TableCell>
              <TableCell style={{ color: "#fff" }}>Status</TableCell>
              <TableCell style={{ color: "#fff" }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((project, index) => (
              <TableRow key={project.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <Button color="primary" variant="text" startIcon={<FaEye />}>
                    View
                  </Button>
                </TableCell>
                <TableCell>{project.uniqueId}</TableCell>
                <TableCell>{project.createdAt}</TableCell>
                <TableCell>{project.status}</TableCell>
                <TableCell>
                  <Button color="primary" variant="text" startIcon={<FaEdit />} />
                  <Button color="error" variant="text" startIcon={<FaTrash />} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{ marginTop: "20px", color: "#05344c" }}
      />
    </div>
  );
};

export default AddNewProjectPage;
