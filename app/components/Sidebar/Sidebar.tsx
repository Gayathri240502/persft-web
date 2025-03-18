"use client";
import { ChevronLeftCircle, ChevronDown } from "lucide-react";
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

    const timer = setTimeout(() => setLoading(false), 1000);

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
      // Close all submenus when sidebar is collapsed
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
    <div className="flex">
      <div
        ref={sidebarRef}
        className={`${
          open ? "w-64" : "w-9"
        } bg-white shadow-xl  pt-1 relative transition-all duration-300`}
      >
        {/* Toggle Button */}
        <button
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple border-2 rounded-full ${
            !open && "rotate-180"
          }`}
          onClick={() => setOpen(!open)}
        >
          <ChevronLeftCircle />
        </button>

        {/* Logo */}
        <div className="flex gap-x-4 items-center p-4">
          <Link href="/dashboard">
            {" "}
            <Image
              width={100}
              height={100}
              alt="logo"
              src="/logo.png"
              className={`cursor-pointer transition-transform duration-500 ${
                open ? "rotate-[360deg]" : ""
              }`}
            />{" "}
          </Link>
          {/* <h1
            className={`text-black font-medium text-xl transition-all ${
              !open ? "hidden" : ""
            }`}
          >
            PerSft
          </h1> */}
        </div>

        {/* Menu Items */}
        <ul className="pt-6">
          {SideLinks.map((item, index) => (
            <div key={index}>
              <li
                className={`flex items-center gap-x-4 p-2 cursor-pointer rounded-md text-black text-base hover:bg-[#05344c] hover:text-white transition-all ${
                  pathName.startsWith(`/${item.pathname}`)
                    ? "bg-[#05344c] text-white"
                    : "bg-light-white"
                }`}
                onClick={() => {
                  if (item.subMenu) {
                    toggleSubMenu(item.title);
                  } else {
                    router.push(`/${item.pathname}`);
                  }
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className={`${!open ? "hidden" : ""} transition-all`}>
                  {item.title}
                </span>
                {item.subMenu && (
                  <ChevronDown
                    className={`ml-auto transition-all ${
                      openSubMenus[item.title] ? "rotate-180" : ""
                    }`}
                  />
                )}
              </li>

              {/* Render Submenu */}
              {item.subMenu && openSubMenus[item.title] && (
                <ul className="pl-6 mt-2 transition-all duration-300">
                  {item.subMenu.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`flex items-center gap-x-4 p-2 cursor-pointer rounded-md text-black text-base hover:bg-[#05344c] hover:text-white transition-all ${
                        pathName.startsWith(`/${subItem.pathname}`)
                          ? "bg-[#05344c]"
                          : "bg-light-white"
                      }`}
                      onClick={() => router.push(`/${subItem.pathname}`)}
                    >
                      <span className="text-lg">{subItem.icon}</span>
                      <span>{subItem.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>

        {/* Sign Out */}
      </div>
    </div>
  );
}
