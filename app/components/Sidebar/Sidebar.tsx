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

import SideLinks from "./SideLinks";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );

  const router = useRouter();
  const pathName = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathName === "/login") return;

    const timer = setTimeout(() => setLoading(false), 500);

    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathName]);

  useEffect(() => {
    if (!open) {
      setOpenSubMenus({});
    }
  }, [open]);

  if (loading || pathName === "/login") return null;

  const toggleSubMenu = (menuTitle: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuTitle]: !prev[menuTitle],
    }));
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

      {/* Logo/Header */}
      <div className="flex justify-center items-center border-gray-200 m-1">
        <Link href="/admin/dashboard">
          <Image
            width={100}
            height={100}
            alt="logo"
            src="/logo.png"
            className={`transition-transform duration-100 ${
              open ? "rotate-[360deg]" : ""
            }`}
          />
        </Link>
      </div>

      {/* Scrollable Content */}
      <ul className="overflow-y-auto custom-scrollbar pr-1">
        {SideLinks.map((item, index) => (
          <div key={index}>
            <li
              className={`flex items-center gap-x-3 p-3 mx-2 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                pathName.startsWith(`/${item.pathname}`)
                  ? "bg-[#05344c] text-white"
                  : "text-gray-700 hover:bg-[#05344c]/10"
              }`}
              onClick={() => {
                if (item.subMenu) {
                  toggleSubMenu(item.title);
                } else {
                  router.push(`/${item.pathname}`);
                }
              }}
            >
              <span className="text-xl">{item.icon}</span>
              {open && <span className="flex-1">{item.title}</span>}
              {item.subMenu && open && (
                <ChevronDownIcon
                  className={`ml-auto transition-transform ${
                    openSubMenus[item.title] ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              )}
            </li>

            {/* Submenu */}
            {item.subMenu && openSubMenus[item.title] && open && (
              <ul className="pl-10">
                {item.subMenu.map((subItem, subIndex) => (
                  <li
                    key={subIndex}
                    className={`flex items-center gap-x-2 px-3 py-2 mx-2 rounded-md cursor-pointer text-sm transition-colors duration-200 ${
                      pathName.startsWith(`/${subItem.pathname}`)
                        ? "bg-[#05344c] text-white"
                        : "text-gray-600 hover:bg-[#05344c]/10"
                    }`}
                    onClick={() => router.push(`/${subItem.pathname}`)}
                  >
                    {subItem.icon && (
                      <span className="text-base">{subItem.icon}</span>
                    )}
                    <span>{subItem.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
}
