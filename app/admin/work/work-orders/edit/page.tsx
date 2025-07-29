"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useTheme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";

const EditWorkGroupStatusPage = () => {
  const theme = useTheme();
  const router = useRouter();

  const { workOrderId, workGroupId } = useParams();

  const [status, setStatus] = useState("in_progress");
  const [actualStartDate, setActualStartDate] = useState<Dayjs | null>(null);
  const [actualEndDate, setActualEndDate] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/v1/work-orders/${workOrderId}/groups/${workGroupId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            actualStartDate: actualStartDate?.toISOString() || null,
            actualEndDate: actualEndDate?.toISOString() || null,
            notes,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update status");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Edit Work Group Status
        </Typography>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ my: 2 }}>
            Work group status updated successfully!
          </Alert>
        )}

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          sx={{ my: 2 }}
        >
          <MenuItem value="not_started">Not Started</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="delayed">Delayed</MenuItem>
        </TextField>

        <DateTimePicker
          label="Actual Start Date"
          value={actualStartDate}
          onChange={(newValue) => setActualStartDate(newValue)}
          slotProps={{ textField: { fullWidth: true, sx: { my: 2 } } }}
        />

        <DateTimePicker
          label="Actual End Date"
          value={actualEndDate}
          onChange={(newValue) => setActualEndDate(newValue)}
          slotProps={{ textField: { fullWidth: true, sx: { my: 2 } } }}
        />

        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4}
          fullWidth
          sx={{ my: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Status"}
        </Button>
      </Paper>
    </Box>
  );
};

export default EditWorkGroupStatusPage;
