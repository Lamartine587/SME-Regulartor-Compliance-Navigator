import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  FolderIcon, 
  BellIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { path: "/permits", label: "Permits", icon: ClipboardDocumentCheckIcon },
    { path: "/vault", label: "Document Vault", icon: FolderIcon },
    { path: "/reminders", label: "Reminders", icon: BellIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg ${isMobileOpen ? "hidden" : "block"}`}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* BACKGROUND CHANGED TO bg-slate-950 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 h-20 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              SME<span className="text-indigo-400">Nav</span>
            </span>
          </div>
          
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-indigo-600/10 text-indigo-400 font-bold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              {isActive(item.path) && <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />}
              <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive(item.path) ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-900 space-y-1">
          <button className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all group">
            <Cog6ToothIcon className="h-5 w-5 mr-3 text-slate-600 group-hover:text-slate-400" />
            Settings
          </button>
          
          <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-rose-500/70" />
            Sign Out
          </button>
        </div>
      </aside>

      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" />}
    </>
  );
}