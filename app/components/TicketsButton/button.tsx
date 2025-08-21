"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Tooltip, IconButton, Box } from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import Link from "next/link";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";

type Ticket = {
  id: string;
  status: string;
};

type DecodedToken = {
  realm_access?: { roles?: string[] };
  roles?: string[];
};

const TicketBadge = () => {
  const { token } = useTokenAndRole();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // check if user is admin
  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const decoded = decodeJwt(token);
      const roles = decoded?.realm_access?.roles || decoded?.roles || [];
      return roles.includes("admin");
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!token || !isAdmin) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPPORT_API_URL}/admin/support/tickets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        const result = Array.isArray(data) ? data : data.tickets || [];
        setTickets(result);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [token, isAdmin]);

  const ticketCount = useMemo(
    () =>
      tickets.filter((t) => t.status === "open" || t.status === "in_progress")
        .length,
    [tickets]
  );

  // if not admin, render nothing
  if (!isAdmin) return null;

  return (
    <Link href="/admin/tickets" passHref>
      <Tooltip title={`${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}`}>
        <IconButton
          color="primary"
          sx={{ position: "relative", padding: "12px" }}
        >
          <ConfirmationNumberIcon fontSize="large" />
          {ticketCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                backgroundColor: "error.main",
                color: "white",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: "bold",
              }}
            >
              {ticketCount}
            </Box>
          )}
        </IconButton>
      </Tooltip>
    </Link>
  );
};

export default TicketBadge;
