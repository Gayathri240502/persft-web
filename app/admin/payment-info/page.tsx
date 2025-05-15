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
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Edit } from "@mui/icons-material";

import ReusableButton from "@/app/components/Button";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import CancelButton from "@/app/components/CancelButton";

interface PaymentInfo {
  id: string;
  sn: number;
  designAmount: number;
  partialAmount: number;
}

const PaymentInfoPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = getTokenAndRole();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [allRows, setAllRows] = useState<PaymentInfo[]>([]);
  const [rows, setRows] = useState<PaymentInfo[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    designAmount: 1000,
    partialAmount: 50,
  });

  const fetchPaymentInfos = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

      const item = await res.json();

      const items: PaymentInfo[] = [
        {
          id: item._id,
          sn: 1,
          designAmount: item.designAmount,
          partialAmount: item.partialAmount,
        },
      ];

      setAllRows(items);
      setRowCount(items.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentInfos();
  }, []);

  useEffect(() => {
    const filtered = allRows.filter(
      (row) =>
        row.designAmount.toString().includes(search) ||
        row.partialAmount.toString().includes(search)
    );
    const start = paginationModel.page * paginationModel.pageSize;
    const paginated = filtered.slice(start, start + paginationModel.pageSize);

    setRows(paginated);
    setRowCount(filtered.length);
  }, [search, paginationModel, allRows]);

  const handleSubmit = async () => {
    const method = formData.id ? "PATCH" : "POST";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/pay-info`;

    const requestBody: {
      designAmount: number;
      partialAmount: number;
      id?: string;
    } = {
      designAmount: formData.designAmount,
      partialAmount: formData.partialAmount,
    };

    if (method === "PATCH") {
      if (!formData.id) {
        setError("ID is required for updating.");
        return;
      }
      requestBody.id = formData.id;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        setError(
          `Failed to ${method}: ${errorDetails.message || "Unknown error"}`
        );
        throw new Error(
          `Failed to ${method}: ${errorDetails.message || "Unknown error"}`
        );
      }

      setSuccessMsg(
        `Payment info ${method === "POST" ? "added" : "updated"} successfully`
      );
      setAddDialogOpen(false);
      fetchPaymentInfos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  };

  const handleEditClick = (params: GridRenderCellParams) => {
    setFormData({
      id: params.row.id,
      designAmount: params.row.designAmount,
      partialAmount: params.row.partialAmount,
    });
    setAddDialogOpen(true);
  };

  const handleAddClick = () => {
    setFormData({ id: "", designAmount: 1000, partialAmount: 50 });
    setAddDialogOpen(true);
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
          <IconButton
            onClick={() => handleEditClick(params)}
            size="small"
            color="primary"
          >
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
        <ReusableButton onClick={handleAddClick}>ADD</ReusableButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {formData.id ? "Edit Payment Info" : "Add Payment Info"}
        </DialogTitle>
        <DialogContent
  sx={{
    mt: 2,
    px: 2,
    py: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflow: "visible",
  }}
>
  <TextField
    label="Design Amount"
    type="number"
    fullWidth
    variant="outlined"
    value={formData.designAmount}
    onChange={(e) =>
      setFormData({
        ...formData,
        designAmount: parseFloat(e.target.value),
      })
    }
  />
  <TextField
    label="Partial Amount"
    type="number"
    fullWidth
    variant="outlined"
    value={formData.partialAmount}
    onChange={(e) =>
      setFormData({
        ...formData,
        partialAmount: parseFloat(e.target.value),
      })
    }
  />
</DialogContent>
        <DialogActions>
          <CancelButton onClick={() => setAddDialogOpen(false)}>Cancel</CancelButton>
          <ReusableButton variant="contained" onClick={handleSubmit}>
            {formData.id ? "Update" : "Add"}
          </ReusableButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        message={successMsg}
      />
    </Box>
  );
};

export default PaymentInfoPage;
