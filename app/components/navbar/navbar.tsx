"use client";

import { useEffect, useState } from "react";
import { Menu, MenuItem, IconButton, Divider, Avatar } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Badge,
} from "@mui/icons-material";

import {
  getTokenAndRole,
  clearSession,
} from "@/app/containers/utils/session/CheckSession";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";

interface NavbarProps {
  label: string;
}

export default function Navbar({ label }: NavbarProps) {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3); // This would come from your notification system

  const updateUserDetails = () => {
    const { token, role } = getTokenAndRole();
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUserDetails({
          name: decoded.preferred_username || "",
          email: decoded.email || "",
          role: role || decoded.realm_access?.roles[0] || "",
        });
      }
    }
  };

  useEffect(() => {
    updateUserDetails();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        updateUserDetails();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand/Logo - Hidden on mobile when sidebar is present */}
          <div className="hidden lg:flex items-center space-x-4 min-w-0 flex-shrink-0">
            <div className="text-xl font-bold text-blue-600">PerSft</div>
          </div>

          {/* Center: Page Title */}
          <div className="flex-1 flex justify-center  px-4  ">
            <div className="max-w-2xl w-full">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate text-center ">
                {label}
              </h1>
            </div>
          </div>

          {/* Right: Actions and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink-0">
            {/* Notifications */}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="User menu"
                aria-expanded={Boolean(anchorEl)}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    bgcolor: "#ff8e4b",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 600,
                  }}
                >
                  {getInitials(userDetails.name)}
                </Avatar>

                {/* User Info - Hidden on mobile */}
                <div className="hidden sm:block text-left min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-40">
                    {userDetails.name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-32 lg:max-w-40">
                    {userDetails.role || "Member"}
                  </div>
                </div>

                {/* Dropdown arrow */}
                <ExpandMoreIcon
                  className="text-gray-400 transition-transform duration-200"
                  fontSize="small"
                  sx={{
                    transform: Boolean(anchorEl)
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    fontSize: { xs: "18px", sm: "20px" },
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    minWidth: 240,
                    mt: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    "& .MuiMenuItem-root": {
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    },
                  },
                }}
              >
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gray-50 mx-2 my-2 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#ff8e4b",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(userDetails.name)}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userDetails.name || "User Name"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userDetails.email || "user@example.com"}
                      </p>
                      {userDetails.role && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(userDetails.role)}`}
                        >
                          {userDetails.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Divider sx={{ my: 1 }} />

                {/* Menu Items */}
                <MenuItem
                  onClick={handleMenuClose}
                  className="hover:bg-gray-50"
                >
                  <PersonIcon fontSize="small" className="mr-3 text-gray-600" />
                  <span className="text-sm">Profile</span>
                </MenuItem>

                <MenuItem
                  onClick={handleMenuClose}
                  className="hover:bg-gray-50"
                >
                  <SettingsIcon
                    fontSize="small"
                    className="mr-3 text-gray-600"
                  />
                  <span className="text-sm">Settings</span>
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogoutIcon fontSize="small" className="mr-3" />
                  <span className="text-sm font-medium">Sign out</span>
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
