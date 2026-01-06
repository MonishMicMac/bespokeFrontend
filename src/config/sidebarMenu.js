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
      },
      {
        title: "Size Master",
        path: "/add/sizemaster",
      },
      {
        title: "Measurement Master",
        path: "/add/measurement",
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
        title: "Room Master",
        path: "/add/room",
      },
      {
        title: "Wear Type Master",
        path: "/add/weartype",
      },
      {
        title: "Measurement Mapping",
        path: "/add/measurement-mapping",
      },
      {
        title: "Material Master",
        path: "/add/material",
      },

      {
        title: "CurrentDeals",
        path: "add/currentdeals",
      },
      {
        title: "Supers Deals",
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
        title: "Vendor List",
        path: "/VendorList",
      },
      {
        title: "Customer List",
        path: "/CustomerList",
      },
      {
        title: "Order List",
        path: "/orderlist",
      },
    ],
  },
];
