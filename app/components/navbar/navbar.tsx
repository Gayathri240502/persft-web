"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  MenuItem,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

import {
  getTokenAndRole,
  clearSession,
} from "@/app/containers/utils/session/CheckSession";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";

export default function Navbar() {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const pathname = usePathname();

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

    // Listen for storage changes (triggers when user logs in)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        updateUserDetails();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (pathname === "/login") return null;

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
    <>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 mx-2 shadow-md overflow-hidden">
        <div className="text-xl font-bold flex items-center space-x-2">
          <span className="text-blue-500">PerSft</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Dropdown */}
          <IconButton
            onClick={handleMenuClick}
            className="inline-flex items-center px-4 py-2 bg-blue-400 rounded-lg hover:bg-gray-300"
          >
            <div className="w-8 h-8 rounded-full bg-[#ff8e4b] text-white flex items-center justify-center font-semibold mr-2">
              {getInitials(userDetails.name)}
            </div>
            <div className="text-sm font-semibold">{userDetails.name}</div>
            <ExpandMoreIcon className="ml-2" size={18} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium">{userDetails.name}</p>
              <p className="text-xs text-gray-500 mt-1">{userDetails.email}</p>
            </div>

            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </nav>
    </>
  );
}
