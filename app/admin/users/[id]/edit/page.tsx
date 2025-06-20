"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
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
  // roles: string[];
}

// const availableRoles = ["admin", "merchant", "customer", "kisok"];

const UserEditPage: React.FC = () => {
  const [user, setUser] = useState<User>({
    _id: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    enabled: false,
    // roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

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
        setUser({
          ...data,
          // roles: data.roles || [],
        });
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
    <Navbar label="Users"/>
    <Box p={4}>
      {/* <Button
        onClick={() => router.push(`/admin/users`)}
        sx={{ marginBottom: 2 }}
      >
        Back 
      </Button> */}
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
              // onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
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

          {/* <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                multiple
                value={user.roles}
                onChange={(e) => {
                  const value = e.target.value;
                  setUser({
                    ...user,
                    roles: typeof value === "string" ? value.split(",") : value,
                  });
                }}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (selected as string[]).join(", ")}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>*/}
        </Grid>
        <Divider sx={{ my: 4 }} />
         <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "save"}
        </ReusableButton>
        <CancelButton href="/admin/users">Cancel</CancelButton>
      </Box>
      </Paper>
    </Box>
    </>
  );
};

export default UserEditPage;
