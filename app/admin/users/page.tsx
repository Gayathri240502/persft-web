"use client";
import ReusableButton from "@/app/components/Button";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  Switch,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import StyledDataGrid from "@/app/components/StyledDataGrid/StyledDataGrid";
interface UserProps {
  _id?: string;
  keycloakId?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  password: string;
}

const Users = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [data, setData] = useState<UserProps[]>([]);

  const { token } = getTokenAndRole();

  const columns: GridColDef[] = [
    { field: "username", headerName: "User Name", flex: 1 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    {
      field: "role",
      headerName: "Roles",
      flex: 1,
      renderCell: (params) =>
        Array.isArray(params.row?.role) ? params.row.role.join(", ") : "—",
    },
    {
      field: "enabled",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Switch
          checked={params.row.enabled}
          onChange={async () => {
            try {
              const updatedStatus = !params.row.enabled;
              console.log("Updated status:", updatedStatus);
              console.log("User ID:", params.row.keycloakId);
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${
                  params.row.keycloakId
                }`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ enabled: updatedStatus }),
                }
              );

              if (res.ok) {
                fetchUsers(); // refresh the list
              } else {
                console.error("Failed to update status");
              }
            } catch (error) {
              console.error("Error updating status:", error);
            }
          }}
          color="primary"
        />
      ),
    },
    {
      field: "options",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div>
          <IconButton
            color="primary"
            size="small"
            onClick={() => router.push(`/admin/users/${params.row.keycloakId}`)}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(`/admin/users/${params.row.keycloakId}/edit`)
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small">
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null); // handle invalid JSON
        console.error(
          "Error fetching users:",
          response.status,
          response.statusText
        );
        console.error("Response body:", errorBody);
        return;
      }

      const result = await response.json();

      // Extract array from result.users
      if (Array.isArray(result.users)) {
        // Add `id` field for DataGrid compatibility
        const usersWithId = result.users.map((user: any) => ({
          ...user,
          id: user._id,
        }));
        setData(usersWithId);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredData = data.filter((user) =>
    Object.values(user).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography sx={{ mb: 2 }}>Users</Typography>

      <Box
        sx={{
          display: "fixed",

          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: isSmallScreen ? 2 : 1,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth={isSmallScreen}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ReusableButton onClick={() => router.push("/admin/users/add")}>
          ADD
        </ReusableButton>
      </Box>
      <Box>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No users found.
          </Typography>
        ) : (
          <StyledDataGrid
            columns={columns}
            rows={filteredData}
            pageSizeOptions={[5, 10, 25]}
            loading={loading}
          />
        )}
      </Box>
    </Box>
  );
};

export default Users;
