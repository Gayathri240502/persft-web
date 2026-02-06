"use client";
import {
  ChevronLeftCircle,
  ChevronDown as ChevronDownIcon,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@mui/material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";
import localMenus from "../../../menus_data.json";
import projectManagerMenus from "../../../menus_project_manager.json";
import financeMenus from "../../../menus_finance.json";
import designerMenus from "../../../menus_designer.json";
import vendorMenus from "../../../menus_vendor.json";
import supportMenus from "../../../menus_support.json";

interface MenuItem {
  _id: string;
  name: string;
  pathname?: string;
  order: number;
  image?: string;
  role: string;
  parentId: string | null;
  parentName?: string | null;
  isCategory: boolean;
}

// Define the preferred order of parent menu items
const PREFERRED_ORDER = [
  "Dashboard",
  "Home Catalog",
  "Attribute Catalog",
  "Product Catalog",
  "Vendors",
  "Projects",
  "Kiosk Management",
  "Work",
  "Design Payments",
  "Orders",
  "Tickets",
  "Users",
  "Service-Charges",
  "Settings",
] as const;

// Constants for better maintainability
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

const SIDEBAR_WIDTH = {
  EXPANDED: 240,
  COLLAPSED: 64,
} as const;

const ANIMATION_DURATION = 300;

// Custom hook for responsive behavior
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.MOBILE) {
        setScreenSize("mobile");
      } else if (width < BREAKPOINTS.TABLET) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
};

// Custom hook for sidebar state management
const useSidebarState = (screenSize: "mobile" | "tablet" | "desktop") => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  // Initialize sidebar state based on screen size
  useEffect(() => {
    if (screenSize === "desktop") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [screenSize]);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSubMenu = useCallback((id: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  return {
    isOpen,
    openSubMenus,
    toggleSidebar,
    closeSidebar,
    toggleSubMenu,
    setOpenSubMenus,
  };
};

// Memoized menu item component
const MenuItemComponent = memo(
  ({
    item,
    isActive,
    isOpen,
    hasChildren,
    sidebarOpen,
    onMenuClick,
  }: {
    item: MenuItem;
    isActive: boolean;
    isOpen: boolean;
    hasChildren: boolean;
    sidebarOpen: boolean;
    onMenuClick: (item: MenuItem, hasChildren: boolean) => void;
  }) => {
    const renderIcon = (iconHtml?: string) => {
      if (!iconHtml) return null;
      return (
        <span
          className="inline-flex justify-center items-center w-5 h-5"
          dangerouslySetInnerHTML={{ __html: iconHtml }}
        />
      );
    };

    return (
      <Tooltip
        title={!sidebarOpen ? item.name : ""}
        placement="right"
        arrow
        enterDelay={500}
        leaveDelay={0}
      >
        <div className="relative">
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-md z-10" />
          )}

          <button
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group relative ${isActive
              ? "bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-200"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            onClick={() => onMenuClick(item, hasChildren)}
            aria-expanded={hasChildren ? isOpen : undefined}
            aria-haspopup={hasChildren ? "true" : undefined}
          >
            <div
              className={`flex-shrink-0 w-6 flex justify-center transition-colors duration-200 ${isActive
                ? "text-blue-600"
                : "text-gray-500 group-hover:text-gray-700"
                }`}
            >
              {renderIcon(item.image)}
            </div>
            {sidebarOpen && (
              <>
                <span className="text-sm flex-1 truncate font-medium">
                  {item.name}
                </span>
                {hasChildren && (
                  <ChevronDownIcon
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      } ${isActive
                        ? "text-blue-600"
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
    );
  }
);
MenuItemComponent.displayName = "MenuItemComponent";

export default function Sidebar() {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const router = useRouter();
  const pathName = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menusCache = useRef<MenuItem[] | null>(null);

  // Use the NextAuth hook for token and role
  const {
    token,
    role,
    isLoading: authLoading,
    isAuthenticated,
  } = useTokenAndRole();

  const screenSize = useResponsive();
  const isMobile = screenSize === "mobile";

  const {
    isOpen,
    openSubMenus,
    toggleSidebar,
    closeSidebar,
    toggleSubMenu,
    setOpenSubMenus,
  } = useSidebarState(screenSize);

  // Memoized menu calculations
  const { parentMenus, childMenus } = useMemo(() => {
    const parents = menus
      .filter((item) => !item.parentId && (!item.parentName || item.parentName === ""))
      .sort((a, b) => {
        const indexA = PREFERRED_ORDER.indexOf(a.name as any);
        const indexB = PREFERRED_ORDER.indexOf(b.name as any);
        if (indexA >= 0 && indexB >= 0) {
          return indexA - indexB;
        }
        if (indexA >= 0) return -1;
        if (indexB >= 0) return 1;
        return a.order - b.order;
      });

    const children = menus.filter((item) => !!item.parentId || (item.parentName && item.parentName !== ""));

    return { parentMenus: parents, childMenus: children };
  }, [menus]);

  const resolvePath = useCallback((item: MenuItem) => {
    if (!item.pathname) return null;
    if (item.pathname.startsWith("/")) return item.pathname;
    if (item.pathname.startsWith("#")) {
      // Custom mapping for parent navigation (e.g., #homecatalog -> /admin/home-catalog)
      return `/admin/${item.name.toLowerCase().replace(/ /g, "-")}`;
    }
    return `/${item.pathname}`;
  }, []);

  // Function to determine if a menu item or its children are active
  const isMenuActive = useCallback(
    (item: MenuItem, childMenus: MenuItem[]) => {
      const mappedPath = resolvePath(item);
      if (mappedPath && pathName === mappedPath) {
        return true;
      }
      if (
        mappedPath &&
        pathName.startsWith(mappedPath) &&
        mappedPath !== "/" &&
        mappedPath !== "/admin"
      ) {
        return true;
      }
      const children = childMenus.filter(
        (child) =>
          (item._id && child.parentId === item._id) ||
          (item.name && child.parentName === item.name)
      );
      return children.some(
        (child) => {
          const childPath = resolvePath(child);
          return childPath && (pathName === childPath || pathName.startsWith(childPath));
        }
      );
    },
    [pathName, resolvePath]
  );

  // Auto-open submenus for active parent items
  useEffect(() => {
    if (menus.length > 0) {
      const newOpenSubMenus = { ...openSubMenus };
      parentMenus.forEach((parent) => {
        const children = childMenus.filter(
          (child) =>
            (parent._id && child.parentId === parent._id) ||
            (parent.name && child.parentName === parent.name)
        );
        const isActive = children.some(
          (child) => {
            const childPath = resolvePath(child);
            return childPath && pathName.startsWith(childPath);
          }
        );
        if (isActive) {
          newOpenSubMenus[parent._id || parent.name] = true;
        }
      });
      setOpenSubMenus(newOpenSubMenus);
    }
  }, [menus, pathName, parentMenus, childMenus, resolvePath]);

  const fetchMenus = useCallback(async () => {
    if (menusCache.current) {
      setMenus(menusCache.current);
      setLoading(false);
      return;
    }

    if (authLoading || !isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      const decoded: any = decodeJwt(token);
      const roles = decoded?.realm_access?.roles || role || [];
      let effectiveRole = "none";

      if (roles.includes("admin")) {
        effectiveRole = "admin";
      } else if (roles.includes("merchant")) {
        effectiveRole = "merchant";
      } else if (roles.includes("project_manager")) {
        // Force use of local project manager menus, skipping API call
        setMenus(projectManagerMenus as any[]);
        menusCache.current = projectManagerMenus as any[];
        setLoading(false);
        return;
      } else if (roles.includes("finance")) {
        // Force use of local finance menus, skipping API call
        setMenus(financeMenus as any[]);
        menusCache.current = financeMenus as any[];
        setLoading(false);
        return;
      } else if (roles.includes("designer")) {
        // Force use of local designer menus, skipping API call
        setMenus(designerMenus as any[]);
        menusCache.current = designerMenus as any[];
        setLoading(false);
        return;
      } else if (roles.includes("vendor")) {
        // Force use of local vendor menus, skipping API call
        setMenus(vendorMenus as any[]);
        menusCache.current = vendorMenus as any[];
        setLoading(false);
        return;
      } else if (roles.includes("support")) {
        // Force use of local support menus, skipping API call
        setMenus(supportMenus as any[]);
        menusCache.current = supportMenus as any[];
        setLoading(false);
        return;
      } else {
        effectiveRole = roles[1] || roles[0] || "none";
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/menus/role/${effectiveRole}`
        : null;

      let apiData: MenuItem[] = [];

      if (apiUrl) {
        try {
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            const data = await response.json().catch(() => []);

            // Helper to flatten nested menu structure
            const flattenMenus = (items: any[]): MenuItem[] => {
              let result: MenuItem[] = [];
              items.forEach(item => {
                const { children, roles, ...rest } = item;
                // Normalize role: API uses 'roles' array, local uses 'role' string
                const newItem: any = {
                  ...rest,
                  role: roles && roles.length > 0 ? roles[0] : (rest.role || 'none')
                };
                result.push(newItem);
                if (children && Array.isArray(children)) {
                  result = result.concat(flattenMenus(children));
                }
              });
              return result;
            };

            if (Array.isArray(data)) {
              apiData = flattenMenus(data);
            }
          }
        } catch (fetchErr) {
          console.warn("Sidebar: API fetch network error:", fetchErr);
        }
      }

      // Merge Strategy: Prioritize API data if available.
      // If API returns data, use it (merged with local for any missing props).
      // If API fails/empty, fallback to localMenus.

      let merged: MenuItem[] = [];

      if (apiData.length > 0) {
        // 1. Map API items to merged items (API + Local Config)
        const apiMerged = apiData.map(apiItem => {
          const localItem = (localMenus as any[]).find((l: any) => l.name === apiItem.name);
          return { ...localItem, ...apiItem };
        });

        // 2. Find Local Partial items (items in localMenus that match the role but are NOT in API)
        //    This ensures that if the API is incomplete for a role (e.g. admin), we fallback to local definitions
        //    only for that specific role.
        const localOnlyItems = (localMenus as any[]).filter(localItem => {
          // Check if already in API
          const existsInApi = apiData.some(apiItem => apiItem.name === localItem.name);
          if (existsInApi) return false;

          // Check if role matches
          // localItem.role is a string. localMenus items usually have single 'role'.
          // We compare against effectiveRole which we determined earlier.
          return localItem.role === effectiveRole;
        });

        merged = [...apiMerged, ...localOnlyItems];
      } else {
        if (effectiveRole === "project_manager") {
          merged = projectManagerMenus as any[];
        } else if (effectiveRole === "finance") {
          merged = financeMenus as any[];
        } else if (effectiveRole === "designer") {
          merged = designerMenus as any[];
        } else if (effectiveRole === "vendor") {
          merged = vendorMenus as any[];
        } else if (effectiveRole === "support") {
          merged = supportMenus as any[];
        } else {
          merged = localMenus as any[];
        }
      }

      setMenus(merged);
      menusCache.current = merged;
    } catch (error) {
      console.error("Failed to fetch sidebar menus, using local:", error);

      const decoded: any = decodeJwt(token);
      const roles = decoded?.realm_access?.roles || role || [];
      const isProjectManager = roles.includes("project_manager");

      if (isProjectManager) {
        setMenus(projectManagerMenus as any[]);
        menusCache.current = projectManagerMenus as any[];
      } else if (roles.includes("finance")) {
        setMenus(financeMenus as any[]);
        menusCache.current = financeMenus as any[];
      } else if (roles.includes("designer")) {
        setMenus(designerMenus as any[]);
        menusCache.current = designerMenus as any[];
      } else if (roles.includes("vendor")) {
        setMenus(vendorMenus as any[]);
        menusCache.current = vendorMenus as any[];
      } else if (roles.includes("support")) {
        setMenus(supportMenus as any[]);
        menusCache.current = supportMenus as any[];
      } else {
        setMenus(localMenus as any[]);
        menusCache.current = localMenus as any[];
      }
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, isAuthenticated, role]);

  useEffect(() => {
    if (pathName !== "/login" && !authLoading) {
      fetchMenus();
    }
  }, [pathName, fetchMenus, authLoading]);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        isMobile
      ) {
        const isTooltipClick = (target as Element).closest?.(
          ".MuiTooltip-root, .MuiTooltip-popper, [role='tooltip']"
        );
        if (!isTooltipClick) {
          closeSidebar();
        }
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMobile, closeSidebar]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && isMobile) {
        closeSidebar();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isMobile, closeSidebar]);

  const getChildren = useCallback(
    (parentId: string, name: string) =>
      childMenus
        .filter((child) =>
          (parentId && child.parentId === parentId) ||
          (name && child.parentName === name)
        )
        .sort((a, b) => a.order - b.order),
    [childMenus]
  );

  const handleMenuClick = useCallback(
    (item: MenuItem, hasChildren: boolean) => {
      if (hasChildren) {
        toggleSubMenu(item._id || item.name);
        return; // Fixed: Don't navigate if it's a dropdown module
      }

      const path = resolvePath(item);
      if (path) {
        router.push(path);
        if (isMobile) {
          closeSidebar();
        }
      }
    },
    [toggleSubMenu, router, isMobile, closeSidebar, resolvePath]
  );

  const handleChildMenuClick = useCallback(
    (child: MenuItem) => {
      const path = resolvePath(child);
      if (path) {
        router.push(path);
        if (isMobile) {
          closeSidebar();
        }
      }
    },
    [router, isMobile, closeSidebar, resolvePath]
  );

  const renderIcon = useCallback((iconHtml?: string) => {
    if (!iconHtml) return null;
    return (
      <span
        className="inline-flex justify-center items-center w-5 h-5"
        dangerouslySetInnerHTML={{ __html: iconHtml }}
      />
    );
  }, []);

  if (
    loading ||
    authLoading ||
    pathName === "/login" ||
    pathName === "/verification" ||
    pathName === "/forgot-credentials" ||
    !isAuthenticated
  ) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-[60] w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <CloseIcon size={20} className="text-gray-600" />
          ) : (
            <MenuIcon size={20} className="text-gray-600" />
          )}
        </button>
      )}

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 flex flex-col border-r border-gray-200 transition-all duration-${ANIMATION_DURATION} ease-in-out ${isMobile
          ? `w-${SIDEBAR_WIDTH.EXPANDED}px ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`
          : `${isOpen
            ? `w-${SIDEBAR_WIDTH.EXPANDED}px`
            : `w-${SIDEBAR_WIDTH.COLLAPSED}px`
          } translate-x-0`
          }`}
        style={{
          width: isMobile
            ? `${SIDEBAR_WIDTH.EXPANDED}px`
            : isOpen
              ? `${SIDEBAR_WIDTH.EXPANDED}px`
              : `${SIDEBAR_WIDTH.COLLAPSED}px`,
        }}
      >
        {!isMobile && (
          <button
            className="absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 hover:shadow-lg z-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeftCircle size={14} className="text-gray-600" />
            ) : (
              <MenuIcon size={14} className="text-gray-600" />
            )}
          </button>
        )}

        <div className="flex justify-center items-center py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <Link
            href="/admin/dashboard"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition-all duration-200"
          >
            <Image
              width={isOpen ? 120 : 40}
              height={isOpen ? 50 : 40}
              alt="Company Logo"
              src="/logo.png"
              className="transition-all duration-300 hover:opacity-80"
              priority
            />
          </Link>
        </div>

        <nav
          className="flex-1 overflow-y-auto py-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
          }}
        >
          <div className="px-3">
            <ul className="space-y-1">
              {parentMenus.map((item) => {
                const children = getChildren(item._id, item.name);
                const hasChildren = children.length > 0;
                const isActive = isMenuActive(item, childMenus);
                const isSubmenuOpen = openSubMenus[item._id || item.name];
                return (
                  <li key={item._id || item.name} className="relative">
                    <MenuItemComponent
                      item={item}
                      isActive={isActive}
                      isOpen={isSubmenuOpen}
                      hasChildren={hasChildren}
                      sidebarOpen={isOpen}
                      onMenuClick={handleMenuClick}
                    />
                    {hasChildren && isSubmenuOpen && isOpen && (
                      <ul className="mt-1 ml-6 pl-3 border-l-2 border-gray-100 space-y-1">
                        {children.map((child) => {
                          const childPath = resolvePath(child);
                          const isChildActive = childPath && pathName === childPath;
                          return (
                            <li key={child._id || child.name} className="relative">
                              <Tooltip
                                title={!isOpen ? child.name : ""}
                                placement="right"
                                arrow
                                enterDelay={500}
                                leaveDelay={0}
                              >
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group ${isChildActive
                                    ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                    }`}
                                  onClick={() => handleChildMenuClick(child)}
                                >
                                  {child.image && (
                                    <div
                                      className={`flex-shrink-0 w-5 flex justify-center transition-colors duration-200 ${isChildActive
                                        ? "text-blue-600"
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
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
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

        {isOpen && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-500 text-center">
              Admin Panel v5.0
            </div>
          </div>
        )}
      </aside>

      {!isMobile && (
        <div
          className="transition-all duration-300 flex-shrink-0"
          style={{
            width: isOpen
              ? `${SIDEBAR_WIDTH.EXPANDED}px`
              : `${SIDEBAR_WIDTH.COLLAPSED}px`,
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
