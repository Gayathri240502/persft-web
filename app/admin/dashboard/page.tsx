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
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/* -----------------------
   Types & Interfaces
   ----------------------- */
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

interface Product {
  productId: string;
  productName: string;
  obsBrandGoodId?: string;
  coohomId?: string;
  workGroupName?: string;
  workTaskName?: string;
  targetDays?: number;
  bufferDays?: number;
  poDays?: number;
  assignedAt?: string;
  assignedByName?: string;
  poStatus?: string;
  poAvailable?: boolean;
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
  expectedStartDate?: string;
  expectedCompletionDate?: string;
  assignedProducts?: Product[];
  totalAssignedProducts?: number;
  createdAt?: string;
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

/* -----------------------
   Small UI components
   ----------------------- */
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
  icon: React.ElementType;
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

const AdminQuickInsightCard = ({ stats }: { stats: DashboardData | null }) => {
  const completionRate =
    stats && stats.totalOrders > 0
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
                {product.targetDays ?? "-"} days
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {product.assignedAt
                  ? new Date(product.assignedAt).toLocaleDateString("en-IN")
                  : "-"}
              </Typography>
            </Box>
            <Chip
              label={product.poStatus ?? "N/A"}
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

/* -----------------------
   Main Component
   ----------------------- */
const DesignOrdersDashboard: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useTokenAndRole();
  const router = useRouter();

  const [adminStats, setAdminStats] = useState<DashboardData | null>(null);
  const [merchantStats, setMerchantStats] =
    useState<MerchantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  /* -----------------------
     Redirect when token missing
     ----------------------- */
  useEffect(() => {
    if (!token) {
      // clear local session data and sign out
      try {
        clearSession();
      } catch (e) {
        // ignore
      }
      // use next-auth signOut for cleanup then navigate
      signOut({ redirect: false }).finally(() => {
        router.replace("/login");
      });
    }
  }, [token, router]);

  /* -----------------------
     Robust role detection
     ----------------------- */
  useEffect(() => {
    if (!token) {
      setUserRole("");
      return;
    }

    try {
      const decoded: any = decodeJwt(token);
      console.debug("Decoded token for role detection:", decoded);

      // Collect roles from common places: realm_access.roles, roles, resource_access.<client>.roles
      const realmRoles: string[] = decoded?.realm_access?.roles || [];
      const topRoles: string[] = decoded?.roles || [];
      const resourceRoles: string[] = Object.values(
        decoded?.resource_access || {}
      ).flatMap((r: any) => r?.roles || []);

      const roles = Array.from(
        new Set([...realmRoles, ...topRoles, ...resourceRoles])
      ).map((r) => String(r).toLowerCase());

      if (roles.includes("admin")) {
        setUserRole("admin");
      } else if (roles.includes("merchant") || roles.includes("vendor")) {
        setUserRole("merchant");
      } else {
        // fallback: substring match
        if (roles.some((r) => r.includes("admin"))) setUserRole("admin");
        else if (
          roles.some((r) => r.includes("merchant") || r.includes("vendor"))
        )
          setUserRole("merchant");
        else setUserRole("");
      }
    } catch (err) {
      console.error("Role detection failed:", err);
      setUserRole("");
    }
  }, [token]);

  /* -----------------------
     Unauthorized handler
     ----------------------- */
  const handleUnauthorized = useCallback(() => {
    try {
      clearSession();
    } catch (e) {
      // ignore
    }
    // signOut without redirect then use router replace
    signOut({ redirect: false }).finally(() => {
      router.replace("/login");
    });
  }, [router]);

  /* -----------------------
     Fetchers
     ----------------------- */
  const fetchAdminStats = useCallback(async () => {
    if (!token) return;
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/design-orders/statistics`;
      console.debug("Fetching admin stats from", url);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        console.warn("Admin stats unauthorized (401).");
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Admin API ${res.status}: ${text || res.statusText}`);
      }

      const data: DashboardData = await res.json();
      setAdminStats(data);
    } catch (err) {
      console.error("Fetch admin stats error:", err);
      throw err;
    }
  }, [token, handleUnauthorized]);

  const fetchMerchantStats = useCallback(async () => {
    if (!token) return;
    try {
      const vendorBase = process.env.NEXT_PUBLIC_VENDOR_URL;
      console.debug("Vendor base URL:", vendorBase);

      const productsUrl = `${vendorBase}/merchant-portal/products?page=1&limit=100`;
      console.debug("Fetching products from", productsUrl);
      const productsRes = await fetch(productsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.debug(
        "productsRes.status",
        productsRes.status,
        productsRes.statusText
      );
      if (productsRes.status === 401) {
        console.warn("Products API unauthorized (401).");
        handleUnauthorized();
        return;
      }
      if (!productsRes.ok) {
        const text = await productsRes.text();
        throw new Error(
          `Products API ${productsRes.status}: ${text || productsRes.statusText}`
        );
      }
      const productsData: ProductsResponse = await productsRes.json();

      const workOrdersUrl = `${vendorBase}/merchant-portal/work-orders?page=1&limit=100`;
      console.debug("Fetching work orders from", workOrdersUrl);
      const workOrdersRes = await fetch(workOrdersUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.debug(
        "workOrdersRes.status",
        workOrdersRes.status,
        workOrdersRes.statusText
      );
      if (workOrdersRes.status === 401) {
        console.warn("WorkOrders API unauthorized (401).");
        handleUnauthorized();
        return;
      }
      if (!workOrdersRes.ok) {
        const text = await workOrdersRes.text();
        throw new Error(
          `WorkOrders API ${workOrdersRes.status}: ${text || workOrdersRes.statusText}`
        );
      }
      const workOrdersData: WorkOrdersResponse = await workOrdersRes.json();

      // build merchant dashboard
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
  }, [token, handleUnauthorized]);

  /* -----------------------
     Orchestrator
     ----------------------- */
  const fetchStats = useCallback(async () => {
    if (!token || !userRole) return;
    setLoading(true);
    setError(null);

    try {
      if (userRole === "admin") {
        await fetchAdminStats();
      } else if (userRole === "merchant") {
        await fetchMerchantStats();
      } else {
        setError("Unknown role. Cannot load dashboard.");
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
    fetchStats();
    // intentionally not adding fetchStats to deps beyond necessary - it's memoized
  }, [userRole, token, fetchStats]);

  /* -----------------------
     Render guards & UI
     ----------------------- */
  if (!token) {
    // redirect in effect above. Show nothing while it happens.
    return null;
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

  if (error) {
    return (
      <>
        <Navbar label="Dashboard" />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "60vh" }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
          >
            <Typography>
              Unable to load dashboard. Check logs for details.
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  // Admin UI
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

  // Merchant UI
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

  // Fallback
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
