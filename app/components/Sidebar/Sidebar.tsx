// components/Sidebar/Sidebar.tsx
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

// Global cache to prevent re-fetching
let globalMenusCache: MenuItem[] | null = null;
let globalMenusPromise: Promise<MenuItem[]> | null = null;

// Routes where sidebar should not be shown
const NO_SIDEBAR_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/unauthorized",
];

// Custom hook for responsive behavior with initialization
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<
    "mobile" | "tablet" | "desktop" | null
  >(null);

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

    // Initial check
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
};

// Custom hook for sidebar state management
const useSidebarState = (
  screenSize: "mobile" | "tablet" | "desktop" | null
) => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  // Initialize sidebar state based on screen size only once
  useEffect(() => {
    if (screenSize !== null && isOpen === null) {
      setIsOpen(screenSize === "desktop");
    }
  }, [screenSize, isOpen]);

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

// Optimized menu fetching hook
const useMenus = (
  token: string,
  isAuthenticated: boolean,
  authLoading: boolean
) => {
  const [menus, setMenus] = useState<MenuItem[]>(globalMenusCache || []);
  const [loading, setLoading] = useState(!globalMenusCache);

  const fetchMenus = useCallback(async (): Promise<MenuItem[]> => {
    if (!isAuthenticated || !token) return [];

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/role/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MenuItem[] = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch sidebar menus:", error);
      return [];
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }

    // Use cached data if available
    if (globalMenusCache) {
      setMenus(globalMenusCache);
      setLoading(false);
      return;
    }

    // Use existing promise or create new one
    if (!globalMenusPromise) {
      globalMenusPromise = fetchMenus();
    }

    globalMenusPromise.then((data) => {
      globalMenusCache = data;
      setMenus(data);
      setLoading(false);
    });

    return () => {
      // Don't clear the promise on unmount to maintain global cache
    };
  }, [fetchMenus, authLoading, isAuthenticated]);

  return { menus, loading };
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
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group relative ${
              isActive
                ? "bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-200"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            onClick={() => onMenuClick(item, hasChildren)}
            aria-expanded={hasChildren ? isOpen : undefined}
            aria-haspopup={hasChildren ? "true" : undefined}
          >
            <div
              className={`flex-shrink-0 w-6 flex justify-center transition-colors duration-200 ${
                isActive
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
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    } ${
                      isActive
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
  const router = useRouter();
  const pathName = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Session management
  const {
    token,
    role,
    isLoading: authLoading,
    isAuthenticated,
  } = useTokenAndRole();

  // Custom hooks
  const screenSize = useResponsive();
  const { menus, loading: menusLoading } = useMenus(
    token,
    isAuthenticated,
    authLoading
  );

  const {
    isOpen,
    openSubMenus,
    toggleSidebar,
    closeSidebar,
    toggleSubMenu,
    setOpenSubMenus,
  } = useSidebarState(screenSize);

  const isMobile = screenSize === "mobile";

  // Don't render sidebar on specific routes or while authentication is loading
  const shouldHideSidebar = useMemo(() => {
    return (
      authLoading ||
      !isAuthenticated ||
      NO_SIDEBAR_ROUTES.includes(pathName) ||
      screenSize === null ||
      isOpen === null
    );
  }, [authLoading, isAuthenticated, pathName, screenSize, isOpen]);

  // Memoized menu calculations
  const { parentMenus, childMenus } = useMemo(() => {
    const parents = menus
      .filter((item) => item.parentId === null)
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

    const children = menus.filter((item) => item.parentId !== null);

    return { parentMenus: parents, childMenus: children };
  }, [menus]);

  // Function to determine if a menu item or its children are active
  const isMenuActive = useCallback(
    (item: MenuItem, childMenus: MenuItem[]) => {
      if (item.pathname && pathName === item.pathname) {
        return true;
      }

      if (
        item.pathname &&
        pathName.includes(item.pathname) &&
        item.pathname !== "/"
      ) {
        return true;
      }

      const children = childMenus.filter(
        (child) => child.parentId === item._id
      );

      return children.some(
        (child) =>
          child.pathname &&
          (pathName === child.pathname || pathName.includes(child.pathname))
      );
    },
    [pathName]
  );

  // Auto-open submenus for active parent items (only when menus are loaded)
  useEffect(() => {
    if (menus.length > 0 && !menusLoading) {
      const newOpenSubMenus: Record<string, boolean> = {};

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

      // Only update if there are changes
      const hasChanges = Object.keys(newOpenSubMenus).some(
        (key) => openSubMenus[key] !== newOpenSubMenus[key]
      );

      if (hasChanges) {
        setOpenSubMenus((prev) => ({ ...prev, ...newOpenSubMenus }));
      }
    }
  }, [menus.length, menusLoading, pathName, parentMenus, childMenus]);

  // Handle click outside to close sidebar
  useEffect(() => {
    if (shouldHideSidebar) return;

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
  }, [isOpen, isMobile, closeSidebar, shouldHideSidebar]);

  // Handle escape key
  useEffect(() => {
    if (shouldHideSidebar) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && isMobile) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isMobile, closeSidebar, shouldHideSidebar]);

  const getChildren = useCallback(
    (parentId: string) =>
      childMenus
        .filter((child) => child.parentId === parentId)
        .sort((a, b) => a.order - b.order),
    [childMenus]
  );

  const handleMenuClick = useCallback(
    (item: MenuItem, hasChildren: boolean) => {
      if (hasChildren) {
        toggleSubMenu(item._id);
      } else if (item.pathname) {
        const path = item.pathname.startsWith("/")
          ? item.pathname
          : `/${item.pathname}`;
        router.push(path);

        if (isMobile) {
          closeSidebar();
        }
      }
    },
    [toggleSubMenu, router, isMobile, closeSidebar]
  );

  const handleChildMenuClick = useCallback(
    (child: MenuItem) => {
      if (child.pathname) {
        const path = child.pathname.startsWith("/")
          ? child.pathname
          : `/${child.pathname}`;
        router.push(path);

        if (isMobile) {
          closeSidebar();
        }
      }
    },
    [router, isMobile, closeSidebar]
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

  // Don't render anything if should hide sidebar
  if (shouldHideSidebar) {
    return null;
  }

  // Show loading state only after session is loaded but menus are still loading
  if (menusLoading && isAuthenticated) {
    return (
      <aside className="w-16 bg-white shadow-xl border-r border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Menu Button - Fixed positioning */}
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

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl z-50 flex flex-col border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? `w-${SIDEBAR_WIDTH.EXPANDED}px ${isOpen ? "translate-x-0" : "-translate-x-full"}`
              : `${isOpen ? `w-${SIDEBAR_WIDTH.EXPANDED}px` : `w-${SIDEBAR_WIDTH.COLLAPSED}px`} translate-x-0`
          }
        `}
        style={{
          width: isMobile
            ? `${SIDEBAR_WIDTH.EXPANDED}px`
            : isOpen
              ? `${SIDEBAR_WIDTH.EXPANDED}px`
              : `${SIDEBAR_WIDTH.COLLAPSED}px`,
        }}
      >
        {/* Desktop Toggle Button */}
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

        {/* Logo Section */}
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

        {/* Navigation Menu */}
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
                const children = getChildren(item._id);
                const hasChildren = children.length > 0;
                const isActive = isMenuActive(item, childMenus);
                const isSubmenuOpen = openSubMenus[item._id];

                return (
                  <li key={item._id} className="relative">
                    <MenuItemComponent
                      item={item}
                      isActive={isActive}
                      isOpen={isSubmenuOpen}
                      hasChildren={hasChildren}
                      sidebarOpen={isOpen ?? false}
                      onMenuClick={handleMenuClick}
                    />

                    {/* Submenu */}
                    {hasChildren && isSubmenuOpen && isOpen && (
                      <ul className="mt-1 ml-6 pl-3 border-l-2 border-gray-100 space-y-1">
                        {children.map((child) => {
                          const isChildActive =
                            child.pathname && pathName === child.pathname;

                          return (
                            <li key={child._id} className="relative">
                              <Tooltip
                                title={!isOpen ? child.name : ""}
                                placement="right"
                                arrow
                                enterDelay={500}
                                leaveDelay={0}
                              >
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group ${
                                    isChildActive
                                      ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                  }`}
                                  onClick={() => handleChildMenuClick(child)}
                                >
                                  {child.image && (
                                    <div
                                      className={`flex-shrink-0 w-5 flex justify-center transition-colors duration-200 ${
                                        isChildActive
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

        {/* Footer */}
        {isOpen && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-500 text-center">
              Admin Panel v2.0
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Spacer - Desktop Only */}
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
