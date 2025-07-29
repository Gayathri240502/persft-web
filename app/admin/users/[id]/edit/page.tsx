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
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import Navbar from "@/app/components/navbar/navbar";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
}

const UserEditPage: React.FC = () => {
  const [user, setUser] = useState<User>({
    _id: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    enabled: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<
    string | null
  >(null);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null
  );
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      setSuccess("User updated successfully!");
      setTimeout(() => router.push(`/admin/users`), 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setChangePasswordError("New password cannot be empty");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      setChangePasswordError(null);
      setChangePasswordSuccess(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            newPassword: newPassword.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      setChangePasswordSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setChangePasswordError(err.message);
    } finally {
      setChangingPassword(false);
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
      <Box p={4}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom>
            Edit User
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={user.username}
                disabled
                onChange={(e) => setUser({ ...user, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={user.firstName}
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={user.enabled}
                    onChange={(e) =>
                      setUser({ ...user, enabled: e.target.checked })
                    }
                  />
                }
                label="Enabled"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="outlined"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <CircularProgress size={20} />
                ) : (
                  "Change Password"
                )}
              </Button>
            </Grid>
          </Grid>

          {changePasswordSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {changePasswordSuccess}
            </Alert>
          )}

          {changePasswordError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {changePasswordError}
            </Alert>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton onClick={handleSave} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Save"}
            </ReusableButton>
            <CancelButton href="/admin/users">Cancel</CancelButton>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default UserEditPage;
