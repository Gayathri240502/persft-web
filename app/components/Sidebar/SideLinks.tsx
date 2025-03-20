
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
  { title: "Dashboard", pathname: "admin/dashboard", icon: <DashboardIcon/> },
  {
    title: "Home Catalog",
    pathname: "home-catalog",
    icon: <HomeWorkIcon/>,
    subMenu: [
      { title: "Residence Types", pathname: "admin/home-catalog/residence-types" },
      { title: "Room Types", pathname: "admin/home-catalog/room-types" },
      { title: "Themes", pathname: "admin/home-catalog/themes", },
      { title: "Design", pathname: "admin/home-catalog/design", },
    ],
  },
  {
    title: "Product Catalog",
    pathname: "product-catalog",
    icon: <InventoryIcon/>,
    subMenu: [
      {
        title: "Category",
        pathname: "admin/product-catalog/category",
        
      },
      {
        title: "Sub Category",
        pathname: "admin/product-catalog/sub-category",
        
      },
      {
        title: "Products",
        pathname: "admin/product-catalog/products",
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
        pathname: "admin/attribute-catalog/attributes",
        
      },
      {
        title: "Attribute Groups",
        pathname: "admin/attribute-catalog/attributes-groups",
        
      },
    ],
  },
  {
    title: "Vendors",
    pathname: "vendors",
    icon: <StoreIcon/>,
    subMenu: [
      { title: "Merchants", pathname: "admin/vendors/merchants",  },
      { title: "Shops", pathname: "admin/vendors/shops",  },
    ],
  },
  {
    title: "Orders",
    pathname: "admin/orders",
    icon: <ShoppingCartIcon/>,
    
  },
  
  {
    title: "Users",
    pathname: "admin/users",
    icon: <GroupIcon/>,
  },

  // Projects Menu
  {
    title: "Projects",
    pathname: "admin/projects",
    icon: <AssignmentIcon/>,
  },
  {
    title: "Payment Orders",
    pathname: "admin/payment-orders",
    icon: <PaymentsIcon/>,
  },
  {
    title: "Kiosk Management",
    pathname: "admin/kiosk-management",
    icon: <PointOfSaleIcon/>,
  },
  {
    title: "Work",
    pathname: "work",
    icon: <WorkIcon />,
    subMenu: [
      { title: "work Group", pathname: "admin/work/work-group", },
      {
        title: "Work Task",
        pathname: "admin/work/work-task",
        
      },
      { title: "Work Ordering", pathname: "admin/work/work-ordering",  },
    ],
  },
  
  {
    title: "Settings",
    pathname: "settings",
    icon: <SettingsIcon/>,
    subMenu: [
      {
        title: "System Settings",
        pathname: "admin/settings/system-settings",
        
      },
      { title: "Languages", pathname: "admin/settings/languages",  },
      { title: "Location", pathname: "admin/settings/location",  },
    ],
  },

  
];

export default SideLinks;
