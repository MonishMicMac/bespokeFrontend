import { Home, User, Settings, FileText } from "lucide-react";

export const sidebarMenu = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
  },

  {
    title: "Master",
    icon: User,
    children: [
      {
        title: "Category",
        path: "/add/category",
      },
      {
        title: "SubCategory",
        path: "/add/subcategory",
      }, {
        title: "Spotlight",
        path: "/add/spotlight",
      },
      {
        title: "AppBanner",
        path: "/add/appbanner",
      },
     
 {
        title: "Designer",
        path: "add/designer",
      },
       {
        title: "CurrentDeals",
        path: "add/currentdeals",
      },
       {
        title: "Super Deals",
        path: "add/superdeals",
      },
      
      

      
    ],
  },

  {
    title: "Product",
    icon: Settings,
    children: [
      {
        title: "Product",
        path: "/products",
      },
      {
        title: "Roles & Permissions",
        path: "/settings/roles",
      },
    ],
  },

  {
    title: "Reports",
    icon: FileText,
    children: [
      {
        title: "Daily Report",
        path: "/reports/daily",
      },
      {
        title: "Monthly Report",
        path: "/reports/monthly",
      },
    ],
  },
];
