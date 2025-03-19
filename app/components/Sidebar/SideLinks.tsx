
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import InventoryIcon from '@mui/icons-material/Inventory';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import PaymentsIcon from '@mui/icons-material/Payments';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import SettingsIcon from '@mui/icons-material/Settings';
import React, { JSX } from "react";

interface SideLink {
  title: string;
  pathname: string;
  icon?: JSX.Element;
  subMenu?: SideLink[];
}

const SideLinks: SideLink[] = [
  { title: "Dashboard", pathname: "dashboard", icon: <DashboardIcon/> },
  {
    title: "Home Catalog",
    pathname: "home-catalog",
    icon: <HomeWorkIcon/>,
    subMenu: [
      { title: "Residence Types", pathname: "home-catalog/residence-types" },
      { title: "Room Types", pathname: "home-catalog/room-types" },
      { title: "Themes", pathname: "home-catalog/themes", },
      { title: "Design", pathname: "home-catalog/design", },
    ],
  },
  {
    title: "Product Catalog",
    pathname: "product-catalog",
    icon: <InventoryIcon/>,
    subMenu: [
      {
        title: "Category",
        pathname: "product-catalog/category",
        
      },
      {
        title: "Sub Category",
        pathname: "product-catalog/sub-category",
        
      },
      {
        title: "Products",
        pathname: "product-catalog/products",
      },
    ],
  },
  {
    title: "Attribute Catalog",
    pathname: "attribute-catalog",
    icon: <PermDataSettingIcon/>,
    subMenu: [
      {
        title: "Attributes",
        pathname: "attribute-catalog/attributes",
        
      },
      {
        title: "Attribute Groups",
        pathname: "attribute-catalog/attributes-groups",
        
      },
    ],
  },
  {
    title: "Vendors",
    pathname: "vendors",
    icon: <StoreIcon/>,
    subMenu: [
      { title: "Merchants", pathname: "vendors/merchants",  },
      { title: "Shops", pathname: "vendors/shops",  },
    ],
  },
  {
    title: "Orders",
    pathname: "orders",
    icon: <ShoppingCartIcon/>,
    
  },
  
  {
    title: "Users",
    pathname: "users",
    icon: <GroupIcon/>,
  },

  // Projects Menu
  {
    title: "Projects",
    pathname: "projects",
    icon: <AssignmentIcon/>,
  },
  {
    title: "Payment Orders",
    pathname: "payment-orders",
    icon: <PaymentsIcon/>,
  },
  {
    title: "Kiosk Management",
    pathname: "kiosk-management",
    icon: <PointOfSaleIcon/>,
  },
  {
    title: "Work",
    pathname: "work",
    icon: <WorkIcon />,
    subMenu: [
      { title: "work Group", pathname: "settings/user-roles", },
      {
        title: "Work Task",
        pathname: "settings/system-settings",
        
      },
      { title: "Work Ordering", pathname: "settings/languages",  },
    ],
  },
  
  {
    title: "Settings",
    pathname: "settings",
    icon: <SettingsIcon/>,
    subMenu: [
      {
        title: "System Settings",
        pathname: "settings/system-settings",
        
      },
      { title: "Languages", pathname: "settings/languages",  },
      { title: "Location", pathname: "settings/location",  },
    ],
  },

  
];

export default SideLinks;
