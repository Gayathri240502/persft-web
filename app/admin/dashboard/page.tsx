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
  Paper,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  MonetizationOn,
  TrendingUp,
  Assessment,
  Today,
  Inventory,
  Assignment,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Navbar from "@/app/components/navbar/navbar";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";
import {
  clearSession,
  useTokenAndRole,
} from "@/app/containers/utils/session/CheckSession";
import { clear } from "console";
import { signOut } from "next-auth/react";

// Admin interfaces
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

// Merchant interfaces
interface Product {
  productId: string;
  productName: string;
  obsBrandGoodId: string;
  coohomId: string;
  workGroupName: string;
  workTaskName: string;
  targetDays: number;
  bufferDays: number;
  poDays: number;
  assignedAt: string;
  assignedByName: string;
  poStatus: string;
  poAvailable: boolean;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WorkOrder {
  workOrderId: string;
  status: string;
  expectedStartDate: string;
  expectedCompletionDate: string;
  assignedProducts: Product[];
  totalAssignedProducts: number;
  createdAt: string;
}

interface WorkOrdersResponse {
  workOrders: WorkOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MerchantDashboardData {
  totalProducts: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  recentProducts: Product[];
  recentWorkOrders: WorkOrder[];
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  bgGradient,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: typeof ShoppingCart;
  bgGradient: string;
  subtitle?: string;
  trend?: string;
}) => (
  <Card
    sx={{
      position: "relative",
      overflow: "hidden",
      height: { xs: 140, sm: 160 },
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
      },
    }}
  >
    <Box
      sx={{
        background: bgGradient,
        height: "100%",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              mt: 0.5,
              mb: 1,
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
          }}
        >
          <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: "white" }} />
        </Avatar>
      </Box>
      {trend && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <TrendingUp
            sx={{ fontSize: 16, color: "rgba(255,255,255,0.8)", mr: 0.5 }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
            {trend}
          </Typography>
        </Box>
      )}
    </Box>
  </Card>
);

// Admin Quick Insights
const AdminQuickInsightCard = ({ stats }: { stats: DashboardData | null }) => {
  const completionRate = stats
    ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
    : "0";

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Assessment sx={{ mr: 1, fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quick Insights
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
            Completion Rate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {completionRate}%
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Merchant Quick Insights
const MerchantQuickInsightCard = ({
  stats,
}: {
  stats: MerchantDashboardData | null;
}) => {
  const activeRate =
    stats && stats.totalWorkOrders > 0
      ? ((stats.activeWorkOrders / stats.totalWorkOrders) * 100).toFixed(1)
      : "0";

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Assessment sx={{ mr: 1, fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quick Insights
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
            Active Rate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {activeRate}%
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Admin Recent Orders
const RecentOrdersCard = ({ orders }: { orders: Order[] }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <Today sx={{ mr: 1, color: "primary.main" }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
        Recent Orders
      </Typography>
    </Box>
    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
      {orders.slice(0, 5).map((order, index) => (
        <Box key={order.orderId}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                #{order.orderId}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {order.customerEmail}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right", mr: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </Typography>
            </Box>
            <Chip
              label={order.status}
              size="small"
              color={
                order.status === "completed"
                  ? "success"
                  : order.status === "pending"
                    ? "warning"
                    : order.status === "cancelled"
                      ? "error"
                      : "default"
              }
              sx={{ minWidth: 80 }}
            />
          </Box>
          {index < orders.slice(0, 5).length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  </Paper>
);

// Merchant Recent Products
const RecentProductsCard = ({ products }: { products: Product[] }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <Inventory sx={{ mr: 1, color: "primary.main" }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
        Recent Products
      </Typography>
    </Box>
    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
      {products.slice(0, 5).map((product, index) => (
        <Box key={`${product.productId}-${index}`}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {product.productName}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {product.workGroupName} - {product.workTaskName}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right", mr: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {product.targetDays} days
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {new Date(product.assignedAt).toLocaleDateString("en-IN")}
              </Typography>
            </Box>
            <Chip
              label={product.poStatus}
              size="small"
              color={
                product.poStatus === "generated"
                  ? "success"
                  : product.poStatus === "not_generated"
                    ? "warning"
                    : "default"
              }
              sx={{ minWidth: 80 }}
            />
          </Box>
          {index < products.slice(0, 5).length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  </Paper>
);

const DesignOrdersDashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useTokenAndRole();

  const [adminStats, setAdminStats] = useState<DashboardData | null>(null);
  const [merchantStats, setMerchantStats] =
    useState<MerchantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  // Determine user role
  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      const roles: string[] =
        decoded?.realm_access?.roles || decoded?.roles || [];

      if (roles.includes("admin")) {
        setUserRole("admin");
      } else if (roles.includes("merchant")) {
        setUserRole("merchant");
      }
    }
  }, [token]);

  // Fetch admin stats
  const fetchAdminStats = useCallback(async () => {
    if (!token) return;

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
      if (res.status === 401) {
        clearSession();
        window.location.href = "/login"; // or kiosk logout page
      }
      const data = await res.json();
      setAdminStats(data);
    } catch (err) {
      console.error("Fetch admin stats error:", err);
      throw err;
    }
  }, [token]);

  // Fetch merchant stats
  const fetchMerchantStats = useCallback(async () => {
    if (!token) return;

    try {
      // Fetch products
      const productsRes = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/products?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!productsRes.ok) {
        throw new Error(
          `Error ${productsRes.status}: ${productsRes.statusText}`
        );
      }
      if (productsRes.status === 401) {
        clearSession();
        window.location.href = "/login"; // or kiosk logout page
      }

      const productsData: ProductsResponse = await productsRes.json();

      // Fetch work orders
      const workOrdersRes = await fetch(
        `${process.env.NEXT_PUBLIC_VENDOR_URL}/merchant-portal/work-orders?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!workOrdersRes.ok) {
        throw new Error(
          `Error ${workOrdersRes.status}: ${workOrdersRes.statusText}`
        );
      }

      const workOrdersData: WorkOrdersResponse = await workOrdersRes.json();

      // Calculate stats
      const activeWorkOrders = workOrdersData.workOrders.filter(
        (wo) => wo.status === "active"
      ).length;
      const completedWorkOrders = workOrdersData.workOrders.filter(
        (wo) => wo.status === "completed"
      ).length;

      const merchantDashboardData: MerchantDashboardData = {
        totalProducts: productsData.total,
        totalWorkOrders: workOrdersData.total,
        activeWorkOrders,
        completedWorkOrders,
        recentProducts: productsData.products.slice(0, 10),
        recentWorkOrders: workOrdersData.workOrders.slice(0, 5),
      };

      setMerchantStats(merchantDashboardData);
    } catch (err) {
      console.error("Fetch merchant stats error:", err);
      throw err;
    }
  }, [token]);

  // Main fetch function
  const fetchStats = useCallback(async () => {
    if (!token || !userRole) return;

    setLoading(true);
    setError(null);

    try {
      if (userRole === "admin") {
        await fetchAdminStats();
      } else if (userRole === "merchant") {
        await fetchMerchantStats();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [token, userRole, fetchAdminStats, fetchMerchantStats]);

  useEffect(() => {
    if (userRole) {
      fetchStats();
    }
  }, [fetchStats, userRole]);

  if (!token) {
    useEffect(() => {
      signOut({ callbackUrl: "/login" });
    }, []);
    return null; // nothing rendered, user is redirected
  }

  if (loading) {
    return (
      <>
        <Navbar label="Dashboard" />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </>
    );
  }

  // Admin Dashboard
  if (userRole === "admin") {
    return (
      <>
        <Navbar label="Dashboard" />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: "grey.50",
            minHeight: "100vh",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Design Orders Dashboard
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard
                title="Total Orders"
                value={adminStats?.totalOrders || 0}
                icon={ShoppingCart}
                bgGradient="linear-gradient(135deg, #1e3c72, #2a5298)"
                subtitle="All time orders"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard
                title="Completed"
                value={adminStats?.completedOrders || 0}
                icon={CheckCircle}
                bgGradient="linear-gradient(135deg, #56ab2f, #a8e6cf)"
                subtitle="Successfully delivered"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard
                title="Pending"
                value={adminStats?.pendingOrders || 0}
                icon={HourglassEmpty}
                bgGradient="linear-gradient(135deg, #f7971e, #ffd200)"
                subtitle="In progress"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard
                title="Cancelled"
                value={adminStats?.cancelledOrders || 0}
                icon={Cancel}
                bgGradient="linear-gradient(135deg, #cb2d3e, #ef473a)"
                subtitle="Order cancelled"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard
                title="Revenue"
                value={`₹${(adminStats?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
                icon={MonetizationOn}
                bgGradient="linear-gradient(135deg, #114357, #f29492)"
                subtitle="Total earnings"
              />
            </Grid>
          </Grid>

          {/* Insights and Recent Orders */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <AdminQuickInsightCard stats={adminStats} />
            </Grid>
            <Grid item xs={12} md={8}>
              <RecentOrdersCard orders={adminStats?.recentOrders || []} />
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }

  // Merchant Dashboard
  if (userRole === "merchant") {
    return (
      <>
        <Navbar label="Vendor Dashboard" />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: "grey.50",
            minHeight: "100vh",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Welcome to Vendor Dashboard
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Total Products"
                value={merchantStats?.totalProducts || 0}
                icon={Inventory}
                bgGradient="linear-gradient(135deg, #1e3c72, #2a5298)"
                subtitle="Assigned products"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Total Work Orders"
                value={merchantStats?.totalWorkOrders || 0}
                icon={Assignment}
                bgGradient="linear-gradient(135deg, #56ab2f, #a8e6cf)"
                subtitle="All work orders"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Active Orders"
                value={merchantStats?.activeWorkOrders || 0}
                icon={HourglassEmpty}
                bgGradient="linear-gradient(135deg, #f7971e, #ffd200)"
                subtitle="In progress"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Completed Orders"
                value={merchantStats?.completedWorkOrders || 0}
                icon={CheckCircle}
                bgGradient="linear-gradient(135deg, #cb2d3e, #ef473a)"
                subtitle="Finished orders"
              />
            </Grid>
          </Grid>

          {/* Insights and Recent Products */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <MerchantQuickInsightCard stats={merchantStats} />
            </Grid>
            <Grid item xs={12} md={8}>
              <RecentProductsCard
                products={merchantStats?.recentProducts || []}
              />
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }

  // Fallback for unknown roles
  return (
    <>
      <Navbar label="Dashboard" />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography>
          You don't have permission to access this dashboard.
        </Typography>
      </Box>
    </>
  );
};

export default DesignOrdersDashboard;
