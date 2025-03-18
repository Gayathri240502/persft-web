"use client";

import { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bell, ChevronDown } from "lucide-react";
import {
  getTokenAndRole,
  clearSession,
} from "@/app/containers/utils/session/CheckSession";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    role: "",
  });
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

  // Run once on mount
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  return (
    <nav className="flex items-center justify-between px-4 py-3 shadow-md">
      <div className="text-xl font-bold flex items-center space-x-2">
        <span className="text-blue-500">PerSft</span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <Bell size={20} />
        </button>

        <Menu as="div" className="relative inline-block text-left z-10">
          <Menu.Button className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            <div className="w-8 h-8 rounded-full bg-[#ff8e4b] text-white flex items-center justify-center font-semibold mr-2">
              {getInitials(userDetails.name)}
            </div>
            <div className="text-sm font-semibold">{userDetails.name}</div>
            <ChevronDown className="ml-2" size={18} />
          </Menu.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-3">
                <Link href="edit-profile">
                  <p className="text-sm font-medium">Edit Profile</p>
                </Link>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{userDetails.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {userDetails.email}
                </p>
              </div>

              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        active ? "bg-red-50 text-red-700" : "text-red-600"
                      }`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </nav>
  );
}
