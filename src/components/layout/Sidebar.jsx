import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ShoppingBag, User } from "lucide-react";
import { sidebarMenu } from "../../config/sidebarMenu";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 font-sans">

      {/* --- BRAND HEADER --- */}
      <div className="h-20 flex items-center px-8 border-b border-slate-50">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200">
            <ShoppingBag size={18} className="text-white" />
          </div>
          {/* Brand Name */}
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600 tracking-tight">
            BESPOKE
          </span>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">

        {sidebarMenu.map((item, index) => (
          <div key={index}>

            {/* 1. SINGLE MENU ITEM */}
            {!item.children ? (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? "bg-pink-600 text-white shadow-md shadow-pink-200 translate-x-1" // Active: Solid Pink
                    : "text-slate-500 hover:bg-pink-50 hover:text-pink-700" // Inactive: Gray -> Hover Pink
                  }`
                }
              >
                <item.icon
                  size={20}
                  className="transition-transform duration-200 group-hover:scale-110"
                  strokeWidth={2}
                />
                {item.title}
              </NavLink>
            ) : (
              <>
                {/* 2. PARENT MENU ITEM (Accordion) */}
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={`
                    group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${openMenu === item.title
                      ? "bg-pink-50 text-pink-700"  // Open State
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800" // Closed State
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={20}
                      className={`transition-colors ${openMenu === item.title ? "text-pink-600" : "text-slate-400 group-hover:text-slate-600"}`}
                    />
                    {item.title}
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-300 ${openMenu === item.title ? "rotate-180 text-pink-600" : ""
                      }`}
                  />
                </button>

                {/* 3. SUBMENU ITEMS */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openMenu === item.title ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-5 pl-4 border-l-2 border-slate-100 space-y-1 py-1">
                    {item.children.map((child, i) => (
                      <NavLink
                        key={i}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                          ${isActive
                            ? "text-pink-600 bg-pink-50" // Submenu Active
                            : "text-slate-500 hover:text-pink-600 hover:bg-slate-50" // Submenu Inactive
                          }`
                        }
                      >
                        {/* Small Dot for active state */}
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${({ isActive }) => isActive ? "bg-pink-600" : "bg-slate-300"}`}></span>
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* --- USER PROFILE FOOTER --- */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-slate-100">
          <div className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">Manage Store</p>
          </div>
        </div>
      </div>

    </aside>
  );
}