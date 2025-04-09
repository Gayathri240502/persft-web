"use client";
import ReusableButton from "@/app/components/Button";
import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface UserProps {
  _id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  role: string[];
  password: string;
}

const columns: GridColDef[] = [
  { field: "firstName", headerName: "First Name", width: 140 },
  { field: "lastName", headerName: "Last Name", width: 140 },
  { field: "email", headerName: "Email", width: 140 },
  { field: "phone", headerName: "Phone", width: 140 },
  {
    field: "role",
    headerName: "Roles",
    width: 140,
    valueGetter: (params) =>
      Array.isArray(params.row?.role) ? params.row.role.join(", ") : "—",
  },
  {
    field: "enabled",
    headerName: "Status",
    width: 140,
    valueGetter: (params) =>
      typeof params.row?.enabled === "boolean"
        ? params.row.enabled
          ? "Active"
          : "Inactive"
        : "—",
  },
  {
    field: "options",
    headerName: "Options",
    width: 140,
    renderCell: () => <span>—</span>,
  },
];

const Users = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [data, setData] = useState<UserProps[]>([]);

  const { token } = getTokenAndRole();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch users:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Fetched users:", result);

      // Extract array from result.users
      if (Array.isArray(result.users)) {
        // Add `id` field for DataGrid compatibility
        const usersWithId = result.users.map((user) => ({
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
          display: "flex",
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

      <Box sx={{ height: 400, width: "99%", overflowX: "auto" }}>
        <DataGrid
          columns={columns}
          rows={filteredData}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
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
      </Box>
    </Box>
  );
};

export default Users;
