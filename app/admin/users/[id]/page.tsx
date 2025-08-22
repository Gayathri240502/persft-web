"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Chip,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";
import Navbar from "@/app/components/navbar/navbar";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  keycloakId: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const UserViewPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data: User = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      setDeleteDialogOpen(false);
      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No user found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Users" />
      <Box p={{ xs: 2, md: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Back
        </Button>

        {/* User Card */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: "column", md: "row" }}
            mb={2}
          >
            {/* Avatar + Name */}
            <Box display="flex" alignItems="center" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {user.username}
                </Typography>
                <Chip
                  label={user.enabled ? "Active" : "Inactive"}
                  color={user.enabled ? "success" : "default"}
                  size="small"
                />
              </Box>
            </Box>

            {/* Action Icons */}
            <Box>
              <IconButton
                color="primary"
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(5, 54, 73, 0.08)",
                  },
                }}
                onClick={() => router.push(`/admin/users/${id}/edit`)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(244, 67, 54, 0.08)",
                  },
                }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* User Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                First Name:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.firstName}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Last Name:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.lastName}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Email:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.email}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Phone:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.phone}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Role:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.role.join(", ")}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Phone Verified:
              </Typography>
              <Chip
                label={user.isPhoneVerified ? "Verified" : "Not Verified"}
                color={user.isPhoneVerified ? "success" : "warning"}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Email Verified:
              </Typography>
              <Chip
                label={user.isEmailVerified ? "Verified" : "Not Verified"}
                color={user.isEmailVerified ? "success" : "warning"}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Created At:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(user.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">
                Updated At:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(user.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle fontWeight={700}>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none" }}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default UserViewPage;
