"use client";

import {
  ChevronLeftCircle,
  ChevronDown as ChevronDownIcon,
  Menu as MenuIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { Tooltip } from "@mui/material";

interface MenuItem {
  _id: string;
  name: string;
  pathname?: string;
  order: number;
  image?: string;
  role: string;
  parentId: string | null;
  isCategory: boolean;
}

// Define the preferred order of parent menu items
const preferredOrder = [
  "Dashboard",
  "Home Catalog",
  "Attribute Catalog",
  "Product Catalog",
  "Vendors",
  "Orders",
  "Users",
  "Projects",
  "Payment Orders",
  "Payment Info",
  "Kiosk Management",
  "Work",
  "Settings",
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const router = useRouter();
  const pathName = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menusCache = useRef<MenuItem[] | null>(null);

  // Function to determine if a menu item or its children are active
  const isMenuActive = useCallback(
    (item: MenuItem, childMenus: MenuItem[]) => {
      // Direct match for the item's pathname
      if (item.pathname && pathName === item.pathname) {
        return true;
      }

      // Check if path includes the item's pathname (for parent items)
      if (
        item.pathname &&
        pathName.includes(item.pathname) &&
        item.pathname !== "/"
      ) {
        return true;
      }

      // Check if any child item's pathname matches the current path
      const children = childMenus.filter(
        (child) => child.parentId === item._id
      );
      if (children.length > 0) {
        return children.some(
          (child) =>
            child.pathname &&
            (pathName === child.pathname || pathName.includes(child.pathname))
        );
      }

      return false;
    },
    [pathName]
  );

  // Automatically open submenus for active parent items
  useEffect(() => {
    if (menus.length > 0) {
      const parentMenus = menus.filter((item) => item.parentId === null);
      const childMenus = menus.filter((item) => item.parentId !== null);

      const newOpenSubMenus = { ...openSubMenus };

      parentMenus.forEach((parent) => {
        const children = childMenus.filter(
          (child) => child.parentId === parent._id
        );
        const isActive = children.some(
          (child) => child.pathname && pathName.includes(child.pathname)
        );

        if (isActive) {
          newOpenSubMenus[parent._id] = true;
        }
      });

      setOpenSubMenus(newOpenSubMenus);
    }
  }, [menus, pathName]);

  const fetchMenus = useCallback(async () => {
    // If we already have menus cached, use them
    if (menusCache.current) {
      setMenus(menusCache.current);
      setLoading(false);
      return;
    }

    try {
      const { token } = getTokenAndRole();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/role/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data: MenuItem[] = await response.json();
      setMenus(data);
      // Cache the menus for future use
      menusCache.current = data;
    } catch (error) {
      console.error("Failed to fetch sidebar menus:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathName !== "/login") {
      fetchMenus();
    }
  }, [pathName, fetchMenus]);

  useEffect(() => {
    if (!open) setOpenSubMenus({});
  }, [open]);

  useEffect(() => {
    // We don't need a timer anymore since we're caching menu data
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading || pathName === "/login") return null;

  const parentMenus = menus
    .filter((item) => item.parentId === null)
    .sort((a, b) => {
      // Sort based on the preferredOrder array
      const indexA = preferredOrder.indexOf(a.name);
      const indexB = preferredOrder.indexOf(b.name);

      // If both items are in the preferred order list
      if (indexA >= 0 && indexB >= 0) {
        return indexA - indexB;
      }

      // If only one item is in the preferred order list
      if (indexA >= 0) return -1;
      if (indexB >= 0) return 1;

      // If neither item is in the list, sort by the order property
      return a.order - b.order;
    });

  const childMenus = menus.filter((item) => item.parentId !== null);

  const getChildren = (parentId: string) =>
    childMenus
      .filter((child) => child.parentId === parentId)
      .sort((a, b) => a.order - b.order);

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderIcon = (iconHtml?: string) => {
    if (!iconHtml) return null;
    return (
      <span
        className="inline-flex justify-center items-center"
        dangerouslySetInnerHTML={{ __html: iconHtml }}
      />
    );
  };

  return (
    <div
      ref={sidebarRef}
      className={`${
        open ? "w-64" : "w-16"
      } bg-white shadow-lg  transition-all duration-300 ease-in-out relative flex flex-col border-r border-gray-200`}
    >
      {/* Toggle Button */}
      <button
        className="absolute -right-3 top-9 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-20 transition-transform duration-300"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Sidebar"
      >
        {open ? <ChevronLeftCircle size={18} /> : <MenuIcon size={18} />}
      </button>

      {/* Logo */}
      <div className="flex justify-center items-center py-4 border-b border-gray-200">
        <Link href="/admin/dashboard">
          <Image
            width={open ? 100 : 40}
            height={open ? 100 : 40}
            alt="logo"
            src="/logo.png"
            className="transition-all duration-300"
          />
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
        <ul className="space-y-1 px-3">
          {parentMenus.map((item) => {
            const children = getChildren(item._id);
            const hasChildren = children.length > 0;
            const isActive = isMenuActive(item, childMenus);
            const isOpen = openSubMenus[item._id];

            return (
              <li key={item._id} className="relative">
                <Tooltip title={!open ? item.name : ""} placement="right" arrow>
                  <div className={isActive ? "relative" : ""}>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#05344c] rounded-r-md" />
                    )}
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-200 ${
                        isActive
                          ? "bg-[#05344c] text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        if (hasChildren) {
                          toggleSubMenu(item._id);
                        } else if (item.pathname) {
                          router.push(
                            item.pathname.startsWith("/")
                              ? item.pathname
                              : `/${item.pathname}`
                          );
                        }
                      }}
                    >
                      <div
                        className={`flex-shrink-0 w-6 flex justify-center ${isActive ? "text-white" : "text-gray-500"}`}
                      >
                        {renderIcon(item.image)}
                      </div>
                      {open && (
                        <span
                          className={`text-sm flex-1 truncate ${isActive ? "text-white" : "text-gray-700"}`}
                        >
                          {item.name}
                        </span>
                      )}
                      {hasChildren && open && (
                        <ChevronDownIcon
                          className={`flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          } ${isActive ? "text-white" : "text-gray-400"}`}
                          size={16}
                        />
                      )}
                    </button>
                  </div>
                </Tooltip>

                {/* Submenu */}
                {hasChildren && isOpen && open && (
                  <ul className="mt-1 ml-6 pl-2 border-l border-gray-200 space-y-1">
                    {children.map((child) => {
                      const isChildActive =
                        child.pathname && pathName === child.pathname;

                      return (
                        <li key={child._id}>
                          <Tooltip
                            title={!open ? child.name : ""}
                            placement="right"
                            arrow
                          >
                            <button
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-all duration-200 ${
                                isChildActive
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                if (child.pathname) {
                                  router.push(
                                    child.pathname.startsWith("/")
                                      ? child.pathname
                                      : `/${child.pathname}`
                                  );
                                }
                              }}
                            >
                              {child.image && (
                                <div
                                  className={`flex-shrink-0 w-5 flex justify-center ${isChildActive ? "text-blue-600" : "text-gray-500"}`}
                                >
                                  {renderIcon(child.image)}
                                </div>
                              )}
                              <span
                                className={`truncate ${isChildActive ? "text-blue-700" : ""}`}
                              >
                                {child.name}
                              </span>
                              {isChildActive && (
                                <div className="absolute left-0 w-1 h-full bg-blue-600 rounded-r-md" />
                              )}
                            </button>
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
