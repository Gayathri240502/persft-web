"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Chip,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";
import { useRouter } from "next/navigation";

type Message = {
  messageId: string;
  ticketId: string;
  authorId: string;
  authorType: "customer" | "admin";
  authorName: string;
  authorEmail: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
};

type TicketData = {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  type: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "closed";
  workOrderId?: string;
  workOrderNumber?: string;
  designOrderId?: string;
  messageCount: number;
  lastMessageAt: string;
  lastMessageBy: string;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

export default function TicketPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const { token, role } = useTokenAndRole();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const statusMenuOpen = Boolean(anchorEl);
  const router = useRouter();

  const fetchTicket = async (id: string) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 404) setError("Ticket not found");
        else if (res.status === 401) setError("Unauthorized access");
        else setError(`Error fetching ticket: ${res.status}`);
        setTicket(null);
        return;
      }

      const ticketData = await res.json();
      setTicket(ticketData);
    } catch (err) {
      setError("Failed to fetch ticket data");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!token || !replyMessage.trim()) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets/${ticketId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: replyMessage,
            isInternal: false,
          }),
        }
      );

      if (res.ok) {
        setReplyMessage("");
        fetchTicket(ticketId);
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to reply to ticket");
      }
    } catch {
      setError("Failed to reply to ticket");
    }
  };

  const handleCloseTicket = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets/${ticketId}/close`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) fetchTicket(ticketId);
      else {
        const errData = await res.json();
        setError(errData.message || "Failed to close ticket");
      }
    } catch {
      setError("Failed to close ticket");
    }
  };

  const handleStatusUpdate = async (newStatus: TicketData["status"]) => {
    if (!token) return;
    try {
      setStatusUpdateLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) fetchTicket(ticketId);
      else {
        const errData = await res.json();
        setError(errData.message || "Failed to update status");
      }
    } catch {
      setError("Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: TicketData["status"]) => {
    handleStatusUpdate(newStatus);
    handleStatusMenuClose();
  };

  useEffect(() => {
    if (ticketId && token) {
      fetchTicket(ticketId);
    }
  }, [ticketId, token]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "success";
      case "in_progress":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading ticket...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box p={4}>
        <Alert severity="warning">Ticket not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Tickets" />
      <Box p={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ticket #{ticket.ticketNumber}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">
              <strong>Customer:</strong> {ticket.customerName} (
              {ticket.customerEmail})
            </Typography>
            <Typography>
              <strong>Type:</strong> {ticket.type}
            </Typography>
            <Typography>
              <strong>Subject:</strong> {ticket.subject}
            </Typography>
            <Typography>
              <strong>Description:</strong> {ticket.description}
            </Typography>
            <Box>
              <Typography component="span">
                <strong>Priority:</strong>{" "}
              </Typography>
              <Chip
                label={ticket.priority}
                color={getPriorityColor(ticket.priority)}
                size="small"
              />
            </Box>

            {ticket.workOrderNumber && (
              <Typography>
                <strong>Work Order:</strong> #{ticket.workOrderNumber}
              </Typography>
            )}
            <Typography>
              <strong>Created At:</strong> {formatDate(ticket.createdAt)}
            </Typography>
            <Typography>
              <strong>Updated At:</strong> {formatDate(ticket.updatedAt)}
            </Typography>
            {ticket.closedAt && (
              <Typography>
                <strong>Closed At:</strong> {formatDate(ticket.closedAt)}
                {ticket.closedByName && ` by ${ticket.closedByName}`}
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box>
              <Typography component="span" sx={{ mr: 1 }}>
                <strong>Status:</strong>
              </Typography>
              <Chip
                label={ticket.status.replace("_", " ")}
                color={getStatusColor(ticket.status)}
                size="small"
                variant="outlined"
                onClick={handleStatusMenuClick}
                sx={{ cursor: "pointer" }}
              />
              <Menu
                anchorEl={anchorEl}
                open={statusMenuOpen}
                onClose={handleStatusMenuClose}
              >
                {["open", "in_progress", "closed"].map((status) => (
                  <MenuItem
                    key={status}
                    onClick={() =>
                      handleStatusChange(status as TicketData["status"])
                    }
                    disabled={ticket?.status === status}
                  >
                    {status.replace("_", " ")}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Button
              variant="outlined"
              color="error"
              onClick={handleCloseTicket}
              disabled={ticket.status === "closed"}
            >
              Close Ticket
            </Button>
          </Stack>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Messages ({ticket.messageCount})
        </Typography>

        {ticket.messages.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No messages yet.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2} mb={4}>
            {ticket.messages.map((msg) => (
              <Paper
                key={msg.messageId}
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: msg.isInternal
                    ? "rgba(0, 0, 0, 0.04)"
                    : "background.paper",
                  border: msg.isInternal
                    ? "1px dashed rgba(0, 0, 0, 0.12)"
                    : undefined,
                }}
              >
                <Stack spacing={1}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2">
                      <strong>{msg.authorName}</strong>{" "}
                      <Typography component="span" color="text.secondary">
                        ({msg.authorType === "admin" ? "Admin" : "Customer"}) •{" "}
                        {formatDate(msg.createdAt)}
                      </Typography>
                    </Typography>
                    {msg.isInternal && (
                      <Chip
                        size="small"
                        label="Internal"
                        variant="outlined"
                        color="secondary"
                      />
                    )}
                  </Box>
                  <Divider />
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        <Typography variant="h6" gutterBottom>
          Reply to Ticket
        </Typography>
        <TextField
          multiline
          fullWidth
          minRows={3}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Enter your reply message..."
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleReply}
            disabled={!replyMessage.trim()}
          >
            Send Reply
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </>
  );
}
