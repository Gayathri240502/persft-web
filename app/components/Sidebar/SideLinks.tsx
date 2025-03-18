import {
  Home,
  Box,
  Users,
  Settings,
  BarChart2,
  Layers,
  Clipboard,
  Package,
  Globe,
  PlusCircle,
  ShoppingBag,
  CircleUser,
  CircleHelp,
  Tag,
} from "lucide-react";
import React, { JSX } from "react";

interface SideLink {
  title: string;
  pathname: string;
  icon?: JSX.Element;
  subMenu?: SideLink[];
}

const SideLinks: SideLink[] = [
  { title: "Dashboard", pathname: "dashboard", icon: <BarChart2 /> },
  {
    title: "Home Catalog",
    pathname: "home-catalog",
    icon: <Home />,
    subMenu: [
      { title: "Residence Types", pathname: "home-catalog/residence-types" },
      { title: "Room Types", pathname: "home-catalog/room-types" },
      { title: "Themes", pathname: "home-catalog/themes", icon: <Layers /> },
    ],
  },
  {
    title: "Product Catalog",
    pathname: "product-catalog",
    icon: <ShoppingBag />,
    subMenu: [
      {
        title: "Category",
        pathname: "product-catalog/category",
        icon: <Tag />,
      },
      {
        title: "Sub Category",
        pathname: "product-catalog/sub-category",
        icon: <Tag />,
      },
      {
        title: "Products",
        pathname: "product-catalog/products",
        icon: <Box />,
      },
    ],
  },
  {
    title: "Attribute Catalog",
    pathname: "attribute-catalog",
    icon: <Box />,
    subMenu: [
      {
        title: "Attributes",
        pathname: "attribute-catalog/attributes",
        icon: <Box />,
      },
      {
        title: "Attribute Groups",
        pathname: "attribute-catalog/attributes-groups",
        icon: <Layers />,
      },
    ],
  },
  {
    title: "Vendors",
    pathname: "vendors",
    icon: <Users />,
    subMenu: [
      { title: "Merchants", pathname: "vendors/merchants", icon: <Package /> },
      { title: "Shops", pathname: "vendors/shops", icon: <Package /> },
    ],
  },
  {
    title: "Orders",
    pathname: "orders",
    icon: <Clipboard />,
    subMenu: [
      {
        title: "New Orders",
        pathname: "orders/new-orders",
        icon: <Clipboard />,
      },
      {
        title: "List Orders",
        pathname: "orders/list-orders",
        icon: <Clipboard />,
      },
      {
        title: "Cancelled Orders",
        pathname: "orders/canceled-orders",
        icon: <Clipboard />,
      },
    ],
  },
  // New menus added as per your request:

  // Settings Menu

  // Users Menu
  {
    title: "Users",
    pathname: "users",
    icon: <Users />,
    subMenu: [
      {
        title: "Add New Users",
        pathname: "users/add-new-user",
        icon: <PlusCircle />,
      },
      { title: "Users", pathname: "users", icon: <Users /> },
    ],
  },

  // Projects Menu
  {
    title: "Projects",
    pathname: "projects",
    icon: <Box />,
  },
  {
    title: "Account",
    pathname: "edit-profile",
    icon: <CircleUser />,
  },
  {
    title: "Settings",
    pathname: "settings",
    icon: <Settings />,
    subMenu: [
      { title: "User Roles", pathname: "settings/user-roles", icon: <Users /> },
      {
        title: "System Settings",
        pathname: "settings/system-settings",
        icon: <Settings />,
      },
      { title: "Languages", pathname: "settings/languages", icon: <Globe /> },
    ],
  },

  // Help Menu
  {
    title: "Help",
    pathname: "help",
    icon: <CircleHelp />,
  },
];

export default SideLinks;
