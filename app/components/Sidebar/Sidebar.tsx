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
  "Projects",
  "Design Payments",
  "Payment Info",
  "Kiosk Management",
  "Work",
  "Users",
  "Orders",
  "Settings",
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menusCache = useRef<MenuItem[] | null>(null);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Close sidebar when clicking outside - Fixed version
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if sidebar is open and click is outside the sidebar
      if (open && sidebarRef.current && !sidebarRef.current.contains(target)) {
        // On mobile, always close
        if (isMobile) {
          setOpen(false);
        } else {
          // On desktop, you can choose behavior:
          // Option 1: Always close (uncomment next line)
          // setOpen(false);

          // Option 2: Only close if clicked on main content area
          // Check if the click is not on any floating elements like tooltips
          const isTooltipClick = (target as Element).closest?.(
            ".MuiTooltip-root, .MuiTooltip-popper"
          );
          if (!isTooltipClick) {
            setOpen(false);
          }
        }
      }
    };

    // Add a small delay to prevent immediate closing when sidebar opens
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, open]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]); // Removed isMobile condition

  if (loading || pathName === "/login") return null;

  // Improved sorting function with fallback to exact order value
  const parentMenus = menus
    .filter((item) => item.parentId === null)
    .sort((a, b) => {
      // Get the index of each item in the preferred order array
      const indexA = preferredOrder.indexOf(a.name);
      const indexB = preferredOrder.indexOf(b.name);

      // If both items are in the preferred order list
      if (indexA >= 0 && indexB >= 0) {
        return indexA - indexB;
      }

      // If only one item is in the preferred order list
      if (indexA >= 0) return -1;
      if (indexB >= 0) return 1;

      // If neither is in the preferred list, use the order property
      return a.order - b.order;
    });

  const childMenus = menus.filter((item) => item.parentId !== null);

  // Sort child menus by their explicit order property
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

  const handleMenuClick = (item: MenuItem, hasChildren: boolean) => {
    if (hasChildren) {
      toggleSubMenu(item._id);
    } else if (item.pathname) {
      router.push(
        item.pathname.startsWith("/") ? item.pathname : `/${item.pathname}`
      );
      // Close sidebar on mobile after navigation
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  const handleChildMenuClick = (child: MenuItem) => {
    if (child.pathname) {
      router.push(
        child.pathname.startsWith("/") ? child.pathname : `/${child.pathname}`
      );
      // Close sidebar on mobile after navigation
      if (isMobile) {
        setOpen(false);
      }
    }
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
    <>
      {/* Mobile Overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl z-50 transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200 ${
          open ? "w-64" : "w-16"
        } translate-x-0`}
      >
        {/* Toggle Button */}
        <button
          className={`absolute ${
            open ? "-right-3" : "-right-3"
          } top-9 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 hover:shadow-lg z-10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#05344c] focus:ring-offset-2`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? (
            <ChevronLeftCircle size={15} className="text-gray-600" />
          ) : (
            <MenuIcon size={15} className="text-gray-600" />
          )}
        </button>

        {/* Logo Section */}
        <div className="flex justify-center items-center py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <Link
            href="/admin/dashboard"
            className="focus:outline-none  rounded-md"
          >
            <Image
              width={open ? 120 : 40}
              height={open ? 50 : 40}
              alt="Company Logo"
              src="/logo.png"
              className="transition-all duration-300 hover:opacity-80"
              priority
            />
          </Link>
        </div>

        {/* Navigation Menu - Scrollable Area */}
        <nav
          className="flex-1 overflow-y-auto py-4 min-h-0 "
          style={{
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: "#cbd5e1 transparent", // Firefox
            WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          }}
        >
          <div className="px-3">
            <ul className="space-y-1">
              {parentMenus.map((item) => {
                const children = getChildren(item._id);
                const hasChildren = children.length > 0;
                const isActive = isMenuActive(item, childMenus);
                const isOpen = openSubMenus[item._id];

                return (
                  <li key={item._id} className="relative">
                    <Tooltip
                      title={!open ? item.name : ""}
                      placement="right"
                      arrow
                      enterDelay={500}
                      leaveDelay={0}
                    >
                      <div className="relative">
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#05344c] rounded-r-md" />
                        )}

                        <button
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#05344c] focus:ring-offset-1 group ${
                            isActive
                              ? "bg-blue-50 text-[#05344c] font-medium shadow-sm border border-blue-100"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                          onClick={() => handleMenuClick(item, hasChildren)}
                          aria-expanded={hasChildren ? isOpen : undefined}
                          aria-haspopup={hasChildren ? "true" : undefined}
                        >
                          <div
                            className={`flex-shrink-0 w-6 flex justify-center transition-colors duration-200 ${
                              isActive
                                ? "text-[#05344c]"
                                : "text-gray-500 group-hover:text-gray-700"
                            }`}
                          >
                            {renderIcon(item.image)}
                          </div>

                          {open && (
                            <>
                              <span className="text-sm flex-1 truncate font-medium">
                                {item.name}
                              </span>
                              {hasChildren && (
                                <ChevronDownIcon
                                  className={`flex-shrink-0 transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                  } ${
                                    isActive
                                      ? "text-[#05344c]"
                                      : "text-gray-400 group-hover:text-gray-600"
                                  }`}
                                  size={16}
                                />
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </Tooltip>

                    {/* Submenu */}
                    {hasChildren && isOpen && open && (
                      <ul className="mt-1 ml-6 pl-3 border-l-2 border-gray-100 space-y-1">
                        {children.map((child) => {
                          const isChildActive =
                            child.pathname && pathName === child.pathname;

                          return (
                            <li key={child._id} className="relative">
                              <Tooltip
                                title={!open ? child.name : ""}
                                placement="right"
                                arrow
                                enterDelay={500}
                                leaveDelay={0}
                              >
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 focus:outline-none  focus:ring-offset-1 group ${
                                    isChildActive
                                      ? "bg-blue-100 text-[#05344c] font-medium shadow-sm"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                  }`}
                                  onClick={() => handleChildMenuClick(child)}
                                >
                                  {child.image && (
                                    <div
                                      className={`flex-shrink-0 w-5 flex justify-center transition-colors duration-200 ${
                                        isChildActive
                                          ? "text-[#05344c]"
                                          : "text-gray-500 group-hover:text-gray-700"
                                      }`}
                                    >
                                      {renderIcon(child.image)}
                                    </div>
                                  )}
                                  <span className="truncate flex-1">
                                    {child.name}
                                  </span>
                                  {isChildActive && (
                                    <div className="w-2 h-2 bg-[#05344c] rounded-full flex-shrink-0" />
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
          </div>
        </nav>

        {/* Footer/Version Info (Optional) */}
        {open && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-500 text-center">
              Admin Panel v1.3
            </div>
          </div>
        )}
      </div>

      {/* Spacer for main content - only on desktop */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          open ? "w-64" : "w-12"
        }`}
        aria-hidden="true"
      />
    </>
  );
}
