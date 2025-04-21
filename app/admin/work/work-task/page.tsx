'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridValueGetter, // Use GridValueGetter directly
  GridRenderCellParams,
  GridCellParams
} from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import ReusableButton from '@/app/components/Button';
import { getTokenAndRole } from '@/app/containers/utils/session/CheckSession';

interface WorkGroup {
  _id: string;
  name: string;
}

interface WorkTask {
  _id: string;
  name: string;
  description: string;
  workGroup?: WorkGroup;
  targetDays: number;
  bufferDays: number;
  poDays: number;
  archive: boolean;
  id?: string;
  sn?: number;
}

const WorkTasksPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWorkTasks = async () => {
    setLoading(true);
    setError('');
    const { page, pageSize } = paginationModel;

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        searchTerm: search,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-tasks?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const result = await response.json();
      const formatted = result.workTasks.map((task: WorkTask, index: number) => ({
        ...task,
        id: task._id,
        sn: page * pageSize + index + 1,
        workGroup: task.workGroup ? task.workGroup : { name: 'N/A' },
      }));

      setTasks(formatted);
      setRowCount(result.totalDocs || formatted.length);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to fetch work tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkTasks();
  }, [paginationModel, search]);

  const columns: GridColDef<WorkTask>[] = [
    { field: 'sn', headerName: 'SN', flex: 0.5 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    {
      field: 'workGroup',
      headerName: 'Work Group',
      flex: 1,
            valueGetter: (params: GridCellParams) => {
              const workTypes: WorkGroup[] = params.row?.workTaskTypes;
              return Array.isArray(workTypes) && workTypes.length > 0
                ? workTypes.map((r) => r.name || "Unknown").join(", ")
                : "N/A";
            },
    },
    { field: 'targetDays', headerName: 'Target Days', flex: 0.8 },
    { field: 'bufferDays', headerName: 'Buffer Days', flex: 0.8 },
    { field: 'poDays', headerName: 'PO Days', flex: 0.8 },
    {
      field: 'archive',
      headerName: 'Archived',
      flex: 0.7,
      type: 'boolean',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: GridRenderCellParams<WorkTask>) => (
        <Box>
          <IconButton color="info" size="small">
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton color="primary" size="small">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? 'h6' : 'h5'} sx={{ mb: 2 }}>
        Work Tasks
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isSmallScreen}
        />
        <ReusableButton onClick={() => router.push('/admin/work/work-task/add')}>
          ADD
        </ReusableButton>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ height: 500, width: '100%', overflowX: 'auto' }}>
        <DataGrid
          columns={columns}
          rows={tasks}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          loading={loading}
          autoHeight
          disableColumnMenu={isSmallScreen}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              fontSize: isSmallScreen ? '0.8rem' : '1rem',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: '#f9f9f9',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#ffffff',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default WorkTasksPage;
