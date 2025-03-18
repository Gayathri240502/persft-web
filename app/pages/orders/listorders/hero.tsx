'use client'

import React, { useState } from 'react';
import { FaFilter, FaDownload, FaUpload, FaRedo,  } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton
} from '@mui/material';

const ListOrdersPage = () => {
  const orders = [
    {
      id: 1,
      orderId: 'ORD123',
      customerName: 'John Doe',
      product: 'Modern Sofa',
      quantity: 2,
      orderDate: '2025-01-01',
      status: 'Pending',
    },
    {
      id: 2,
      orderId: 'ORD124',
      customerName: 'Jane Smith',
      product: 'Leather Chair',
      quantity: 1,
      orderDate: '2025-01-02',
      status: 'Shipped',
    },
    {
      id: 3,
      orderId: 'ORD125',
      customerName: 'Alice Brown',
      product: 'Wooden Table',
      quantity: 3,
      orderDate: '2025-01-03',
      status: 'Delivered',
    },
    // Add more orders as needed
  ];

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

  // Handle pagination changes
      const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

  // Get current orders based on pagination
  const currentOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#05344c' }}>List Orders</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Left Side: Bulk Action Dropdown and Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <FormControl variant="outlined" style={{ minWidth: 150 }}>
              <InputLabel>Bulk Action</InputLabel>
              <Select label="Bulk Action" defaultValue="bulk-action">
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="archive">Archive</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" color="primary" startIcon={<FaFilter />} style={{ display: 'flex', alignItems: 'center' }}>
              Filters
            </Button>
          </div>

          {/* Right Side: Search Bar and Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <TextField label="Search Orders" variant="outlined" style={{ width: '250px' }} />
            <Button variant="contained" color="success" startIcon={<FaUpload />} style={{ display: 'flex', alignItems: 'center' }}>
              Import Orders
            </Button>
            <Button variant="contained" color="warning" startIcon={<FaDownload />} style={{ display: 'flex', alignItems: 'center' }}>
              Export Orders
            </Button>
            <Button variant="contained" color="error" startIcon={<FaRedo />} style={{ display: 'flex', alignItems: 'center' }}>
              Reload
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <Paper elevation={3} style={{ padding: '16px' }}>
        <TableContainer>
          <Table>
            <TableHead style={{ backgroundColor: '#05344c', color: 'white' }}>
              <TableRow>
                <TableCell style={{ color: 'white' }}>S.No</TableCell>
                <TableCell style={{ color: 'white' }}>Order ID</TableCell>
                <TableCell style={{ color: 'white' }}>Customer Name</TableCell>
                <TableCell style={{ color: 'white' }}>Product</TableCell>
                <TableCell style={{ color: 'white' }}>Quantity</TableCell>
                <TableCell style={{ color: 'white' }}>Order Date</TableCell>
                <TableCell style={{ color: 'white' }}>Status</TableCell>
                <TableCell style={{ color: 'white' }}>Options</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentOrders.map((order, index) => (
                <TableRow hover key={order.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.status}</TableCell>
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
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', color: '#05344c' }}
      />
    </div>
  );
};

export default ListOrdersPage;
