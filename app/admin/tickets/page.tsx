"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Chip,
  Menu,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { Close as CloseIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
import Navbar from "@/app/components/navbar/navbar";

interface Ticket {
  ticketId: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  type: string;
  subject: string;
  priority: string;
  status: string;

  id?: string;
  sn?: number;
}

const Tickets = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [closingTickets, setClosingTickets] = useState<Set<string>>(new Set());
  const [updatingTickets, setUpdatingTickets] = useState<Set<string>>(
    new Set()
  );
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [searchText, setSearchText] = useState("");

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchTickets = useCallback(async () => {
    const { page, pageSize } = paginationModel;
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (status) queryParams.append("status", status);
      if (type) queryParams.append("type", type);
      if (priority) queryParams.append("priority", priority);
      if (searchText) queryParams.append("search", searchText);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets. Status: ${response.status}`);
      }

      const result = await response.json();

      if (mountedRef.current) {
        if (Array.isArray(result.tickets)) {
          const formatted = result.tickets.map(
            (ticket: Ticket, index: number) => ({
              ...ticket,
              id: ticket.ticketId,
              sn: page * pageSize + index + 1,
            })
          );
          setTickets(formatted);
          setRowCount(result.total || formatted.length);
        } else {
          setTickets([]);
          setRowCount(0);
        }
      }
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      if (mountedRef.current) {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [paginationModel, token, status, type, priority, searchText]);

  useEffect(() => {
    if (token) fetchTickets();
  }, [token, paginationModel, status, type, priority, searchText]);

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleCloseTicket = useCallback(
    async (ticketId: string) => {
      setClosingTickets((prev) => new Set(prev).add(ticketId));
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets/${ticketId}/close`;
        const response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to close ticket. Status: ${response.status} - ${errorText}`
          );
        }
        await fetchTickets();
        setError("");
      } catch (err: any) {
        console.error("Error closing ticket:", err);
        setError(err.message || "Failed to close ticket.");
      } finally {
        setClosingTickets((prev) => {
          const newSet = new Set(prev);
          newSet.delete(ticketId);
          return newSet;
        });
      }
    },
    [token, fetchTickets]
  );

  const handleTicketClick = useCallback(
    (ticketId: string) => {
      router.push(`/admin/tickets/${ticketId}`);
    },
    [router]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "error";
      case "in_progress":
        return "warning";
      case "closed":
        return "success";
      default:
        return "default";
    }
  };

  const handleStatusMenuClick = (
    ticketId: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setStatusMenuAnchor((prev) => ({
      ...prev,
      [ticketId]: event.currentTarget,
    }));
  };

  const handleStatusMenuClose = (ticketId: string) => {
    setStatusMenuAnchor((prev) => ({
      ...prev,
      [ticketId]: null,
    }));
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingTickets((prev) => new Set(prev).add(ticketId));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to update status. Status: ${response.status}`);
      }
      await fetchTickets();
      setError("");
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdatingTickets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
      handleStatusMenuClose(ticketId);
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "sn", headerName: "SN", flex: 0.4 },
      {
        field: "ticketNumber",
        headerName: "Ticket #",
        flex: 1,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            onClick={() => handleTicketClick(params.row.ticketId)}
            sx={{ textTransform: "none", p: 0, minWidth: 0 }}
          >
            {params.value}
          </Button>
        ),
      },
      { field: "customerName", headerName: "Customer", flex: 1 },
      { field: "customerEmail", headerName: "Email", flex: 1.5 },
      { field: "type", headerName: "Type", flex: 1 },
      { field: "subject", headerName: "Subject", flex: 2 },
      {
        field: "priority",
        headerName: "Priority",
        flex: 0.8,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getPriorityColor(params.value)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        renderCell: (params) => (
          <Chip
            label={params.value.replace("_", " ")}
            color={getStatusColor(params.value)}
            size="small"
            variant="outlined"
            onClick={(e) => handleStatusMenuClick(params.row.ticketId, e)}
            sx={{ cursor: "pointer" }}
          />
        ),
      },

      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        flex: 0.8,
        getActions: (params) => {
          const actions = [];
          if (params.row.status !== "closed") {
            actions.push(
              <GridActionsCellItem
                key="close"
                icon={<CloseIcon />}
                label="Close Ticket"
                onClick={() => handleCloseTicket(params.row.ticketId)}
                disabled={closingTickets.has(params.row.ticketId)}
                color="error"
              />
            );
          }
          return actions;
        },
      },
    ],
    [
      handleTicketClick,
      handleCloseTicket,
      handleStatusMenuClick,
      closingTickets,
      updatingTickets,
    ]
  );

  return (
    <>
      <Navbar label="Support Tickets" />
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
          <TextField
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>

          <TextField
            label="Type"
            select
            value={type}
            onChange={(e) => setType(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="work_order_concern">Work Order Concern</MenuItem>
            <MenuItem value="general_contact">General Contact</MenuItem>
          </TextField>

          <TextField
            label="Priority"
            select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
        </Box>

        {loading && tickets.length === 0 ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <Box sx={{ width: "100%" }}>
            <StyledDataGrid
              rows={tickets}
              columns={columns}
              disableAllSorting
              pagination
              rowCount={rowCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 100]}
              autoHeight
              disableColumnMenu={isSmallScreen}
              getRowId={(row) => row.id}
              loading={loading}
              onSearch={handleSearch}
              searchPlaceholder="Search tickets..."
            />
          </Box>
        )}

        {tickets.map((ticket) => (
          <Menu
            key={`menu-${ticket.ticketId}`}
            anchorEl={statusMenuAnchor[ticket.ticketId]}
            open={Boolean(statusMenuAnchor[ticket.ticketId])}
            onClose={() => handleStatusMenuClose(ticket.ticketId)}
          >
            {["open", "in_progress", "closed"].map((status) => (
              <MenuItem
                key={status}
                onClick={() => handleStatusChange(ticket.ticketId, status)}
                disabled={
                  ticket.status === status ||
                  updatingTickets.has(ticket.ticketId)
                }
              >
                <ListItemText>
                  {status === "in_progress"
                    ? "In Progress"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </ListItemText>
              </MenuItem>
            ))}
          </Menu>
        ))}
      </Box>
    </>
  );
};

export default Tickets;
