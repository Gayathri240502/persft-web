"use client";

import {
  ChevronLeftCircle,
  ChevronDown as ChevronDownIcon,
  Menu as MenuIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const fetchMenus = async () => {
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
      } catch (error) {
        console.error("Failed to fetch sidebar menus:", error);
      } finally {
        setLoading(false);
      }
    };

    if (pathName !== "/login") {
      fetchMenus();
    }
  }, [pathName]);

  useEffect(() => {
    if (!open) setOpenSubMenus({});
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);

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
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathName]);

  if (loading || pathName === "/login") return null;

  const parentMenus = menus.filter((item) => item.parentId === null);
  const childMenus = menus.filter((item) => item.parentId !== null);

  const getChildren = (parentId: string) =>
    childMenus.filter((child) => child.parentId === parentId);

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
      } bg-white shadow-lg h-screen transition-all duration-200 relative flex flex-col`}
    >
      {/* Toggle Button */}
      <button
        className="absolute -right-4 top-9 w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 z-20 transition-all"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Sidebar"
      >
        {open ? <ChevronLeftCircle size={22} /> : <MenuIcon size={22} />}
      </button>

      {/* Logo */}
      <div className="flex justify-center items-center border-gray-200 m-1">
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
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="space-y-0.5 px-2 py-2">
          {parentMenus.map((item) => {
            const children = getChildren(item._id);
            const isActive = pathName === item.pathname;
            const isSubActive =
              pathName.includes(item.pathname ?? "") && item.pathname !== "/";
            const isOpen = openSubMenus[item._id];
            const hasChildren = children.length > 0;

            return (
              <li key={item._id} className="relative">
                <Tooltip title={!open ? item.name : ""} placement="right">
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isActive || isSubActive
                        ? "bg-[#05344c] text-white"
                        : "text-gray-700 hover:bg-[#05344c]/10"
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
                    <div className="flex-shrink-0 w-6 flex justify-center">
                      {renderIcon(item.image)}
                    </div>
                    {open && (
                      <span className="text-sm flex-1">{item.name}</span>
                    )}
                    {hasChildren && open && (
                      <ChevronDownIcon
                        className={`flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        size={16}
                      />
                    )}
                  </button>
                </Tooltip>

                {/* Submenu */}
                {hasChildren && isOpen && open && (
                  <ul className="ml-5 mt-1 pl-2 border-l border-gray-200 space-y-1">
                    {children.map((child) => {
                      const isChildActive = pathName === child.pathname;

                      return (
                        <li key={child._id}>
                          <Tooltip
                            title={!open ? child.name : ""}
                            placement="right"
                          >
                            <button
                              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-sm text-left transition-colors ${
                                isChildActive
                                  ? "bg-[#05344c] text-white"
                                  : "text-gray-600 hover:bg-[#05344c]/10"
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
                                <div className="flex-shrink-0 w-5 flex justify-center">
                                  {renderIcon(child.image)}
                                </div>
                              )}
                              <span>{child.name}</span>
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
