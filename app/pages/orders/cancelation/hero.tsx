'use client'

import React, { useState } from 'react';
import { FaRedo,  FaFilter } from 'react-icons/fa';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, InputAdornment, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CanceledOrdersPage = () => {
  const [canceledOrders, ] = useState([
    {
      id: 1,
      orderId: 'ORD101',
      customerName: 'John Doe',
      product: 'Modern Sofa',
      quantity: 1,
      cancellationDate: '2025-01-15',
      reason: 'Customer Request',
    },
    {
      id: 2,
      orderId: 'ORD102',
      customerName: 'Jane Smith',
      product: 'Leather Chair',
      quantity: 2,
      cancellationDate: '2025-01-18',
      reason: 'Out of Stock',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle pagination changes
    const handleChangePage = (_event: React.MouseEvent | null, newPage: number) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };


  return (
    <div style={{ padding: '24px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#05344c' }}>Canceled Orders</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FaFilter />}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            Filters
          </Button>
          <TextField
            label="Search Orders"
            variant="outlined"
            style={{ width: '250px' }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><FaFilter /></InputAdornment>,
            }}
          />
          <Button
            variant="contained"
            color="error"
            startIcon={<FaRedo />}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            Reload
          </Button>
        </div>
      </div>

      {/* Table Section */}
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
                <TableCell style={{ color: 'white' }}>Cancellation Date</TableCell>
                <TableCell style={{ color: 'white' }}>Reason</TableCell>
                <TableCell style={{ color: 'white' }}>Options</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {canceledOrders.length > 0 ? (
                canceledOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order, index) => (
                  <TableRow hover key={order.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.cancellationDate}</TableCell>
                    <TableCell>{order.reason}</TableCell>
                    <TableCell>
                      <IconButton color="primary" size="small"><EditIcon /></IconButton>
                      <IconButton color="error" size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ color: '#05344c' }}>
                    No canceled orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination Section */}
      <TablePagination
        component="div"
        count={canceledOrders.length}
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

export default CanceledOrdersPage;
