"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { Visibility, Edit } from "@mui/icons-material";

import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface PaymentInfo {
  id: string;
  sn: string;
  designAmount: string;
  partialAmount: string;
}

const PaymentInfoPage: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { token } = getTokenAndRole();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<PaymentInfo[]>([]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    designAmount: 1000,
    partialAmount: 50,
  });

  const fetchPaymentInfos = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1),
        limit: String(paginationModel.pageSize),
        searchTerm: search.trim(),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay-info?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

      const data = await res.json();

      const items = (data?.data || []).map((item: any, index: number) => ({
        id: item._id,
        sn: paginationModel.page * paginationModel.pageSize + index + 1,
        designAmount: item.designAmount,
        partialAmount: item.partialAmount,
      }));

      setRows(items);
      setRowCount(data?.totalCount || items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentInfos();
  }, [paginationModel, search]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay-info`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Failed to create: ${res.status}`);

      setAddDialogOpen(false);
      setFormData({ designAmount: 1000, partialAmount: 50 });
      fetchPaymentInfos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  };

 const columns: GridColDef[] = [
  { field: "sn", headerName: "SN", width: 80 },
  {
    field: "designAmount",
    headerName: "Design Amount",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Typography>{params.row.designAmount}</Typography>
    ),
  },
  {
    field: "partialAmount",
    headerName: "Partial Amount",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Typography>{params.row.partialAmount}</Typography>
    ),
  },
  {
    field: "action",
    headerName: "Actions",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Box>
        <IconButton onClick={() => router.push(`/admin/pay-info/${params.row.id}`)} size="small">
          <Visibility fontSize="small" color="primary" />
        </IconButton>
        <IconButton onClick={() => router.push(`/admin/pay-info/edit?id=${params.row.id}`)} size="small" color="primary">
          <Edit fontSize="small" />
        </IconButton>
      </Box>
    ),
  },
];


  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Payment Info
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          flexDirection: isSmallScreen ? "column" : "row",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          fullWidth={isSmallScreen}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel({ ...paginationModel, page: 0 });
          }}
        />
        <ReusableButton onClick={() => setAddDialogOpen(true)}>ADD</ReusableButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <StyledDataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 100]}
          disableColumnMenu={isSmallScreen}
          autoHeight
        />
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Payment Info</DialogTitle>
        <DialogContent sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Design Amount"
            type="number"
            fullWidth
            value={formData.designAmount}
            onChange={(e) =>
              setFormData({ ...formData, designAmount: parseFloat(e.target.value) })
            }
          />
          <TextField
            label="Partial Amount"
            type="number"
            fullWidth
            value={formData.partialAmount}
            onChange={(e) =>
              setFormData({ ...formData, partialAmount: parseFloat(e.target.value) })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentInfoPage;
