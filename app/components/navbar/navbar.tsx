"use client";

import { useEffect, useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

  return (
    <nav className="relative flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-md sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2 z-10 min-w-0 flex-shrink-0">
        <div className="text-lg sm:text-xl font-bold text-blue-500">PerSft</div>
      </div>

      {/* Center: Label - Responsive positioning */}
      <div className="flex-1 flex justify-center px-2 sm:px-4 md:px-8">
        <div className="text-center max-w-full">
          <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 truncate">
            {label}
          </div>
        </div>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center z-10 min-w-0 flex-shrink-0">
        <IconButton
          onClick={handleMenuClick}
          className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-400 rounded-lg hover:bg-blue-500 text-white transition-colors duration-200"
          size="small"
        >
          {/* Avatar */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#ff8e4b] flex items-center justify-center font-semibold text-xs sm:text-sm">
            {getInitials(userDetails.name)}
          </div>

          {/* Name - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:block text-xs sm:text-sm font-semibold ml-2 max-w-24 lg:max-w-32 truncate">
            {userDetails.name}
          </div>

          {/* Dropdown arrow */}
          <ExpandMoreIcon
            className="ml-1 sm:ml-2"
            fontSize="small"
            sx={{ fontSize: { xs: "16px", sm: "20px" } }}
          />
        </IconButton>

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
            style: {
              minWidth: "200px",
              marginTop: "8px",
            },
          }}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userDetails.name}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {userDetails.email}
            </p>
            {userDetails.role && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {userDetails.role}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <MenuItem
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50"
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    </nav>
  );
}
