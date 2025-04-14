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
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

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
    { field: "username", headerName: "User Name", width: 140 },
    { field: "firstName", headerName: "First Name", width: 140 },
    { field: "lastName", headerName: "Last Name", width: 140 },
    { field: "email", headerName: "Email", width: 140 },
    { field: "phone", headerName: "Phone", width: 140 },
    {
      field: "role",
      headerName: "Roles",
      width: 140,
      renderCell: (params) =>
        Array.isArray(params.row?.role) ? params.row.role.join(", ") : "—",
    },
    {
      field: "enabled",
      headerName: "Status",
      width: 140,
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
      headerName: "Options",
      width: 140,
      renderCell: () => <span>—</span>,
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
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mb: 2 }}>
        Users
      </Typography>

      <Box
        sx={{
          display: "fixed",
          flexDirection: isSmallScreen ? "column" : "row",
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
          <DataGrid
            columns={columns}
            rows={filteredData}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            loading={loading}
            hideFooterSelectedRowCount
            disableColumnMenu={isSmallScreen}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                fontSize: isSmallScreen ? "0.8rem" : "1rem",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "#f9f9f9",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#ffffff",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Users;
