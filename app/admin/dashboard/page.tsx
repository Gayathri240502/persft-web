"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CircularProgress,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  ShoppingCart,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  MonetizationOn,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

import Navbar from "@/app/components/navbar/navbar";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Order {
  orderId: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface DashboardData {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  bgGradient,
}: {
  title: string;
  value: string | number;
  icon: typeof ShoppingCart;
  bgGradient: string;
}) => (
  <Card
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      boxShadow: 3,
      background: bgGradient,
      color: "white",
      height: "100%",
    }}
  >
    <Icon sx={{ fontSize: 40, color: "white", mr: 2 }} />
    <Box>
      <Typography variant="subtitle2" sx={{ color: "white", opacity: 0.85 }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ color: "white" }}>
        {value}
      </Typography>
    </Box>
  </Card>
);

const DesignOrdersDashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useTokenAndRole();

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders/statistics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Fetch stats error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <Navbar label="Dashboard" />
      <Box p={isSmallScreen ? 2 : 3}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Total Orders"
                value={stats?.totalOrders || 0}
                icon={ShoppingCart}
                bgGradient="linear-gradient(135deg, #05344c, #0d7fa9)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Completed Orders"
                value={stats?.completedOrders || 0}
                icon={CheckCircle}
                bgGradient="linear-gradient(135deg, #1d976c, #93f9b9)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Pending Orders"
                value={stats?.pendingOrders || 0}
                icon={HourglassEmpty}
                bgGradient="linear-gradient(135deg, #f7971e, #ffd200)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Cancelled Orders"
                value={stats?.cancelledOrders || 0}
                icon={Cancel}
                bgGradient="linear-gradient(135deg, #cb2d3e, #ef473a)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Total Revenue"
                value={`₹${(stats?.totalRevenue / 100).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`}
                icon={MonetizationOn}
                bgGradient="linear-gradient(135deg, #114357, #f29492)"
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
};

export default DesignOrdersDashboard;
