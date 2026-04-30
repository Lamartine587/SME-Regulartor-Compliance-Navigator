import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  FolderIcon, 
  BellIcon, 
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  BugAntIcon,
  BanknotesIcon,
  IdentificationIcon // Added for Personal IDs
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userRole = localStorage.getItem("user_role");

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { path: "/documents", label: "All Documents", icon: FolderIcon }, // Global Vault
    { path: "/permits", label: "Business Permits", icon: ClipboardDocumentCheckIcon },
    { path: "/personal", label: "Personal IDs", icon: IdentificationIcon }, // Distinct Icon
    { path: "/transactions", label: "Financial Ledger", icon: BanknotesIcon },
    { path: "/reminders", label: "Alert Hub", icon: BellIcon },
    { path: "/profile", label: "Profile Settings", icon: UserCircleIcon }, 
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg ${isMobileOpen ? "hidden" : "block"}`}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 lg:h-[12%] h-[15%] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-inner">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              SME<span className="text-indigo-400">Nav</span>
            </span>
          </div>
          
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 opacity-70">Main Menu</p>
          
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-indigo-500/10 text-indigo-300 font-bold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              {isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
              <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive(item.path) ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </Link>
          ))}

          {/* Admin Section */}
          {userRole === "admin" && (
            <div className="pt-6 mt-6 border-t border-slate-800">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 opacity-70">
                System Admin
              </p>
              <Link 
                to="/admin/errors" 
                className="flex items-center px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all"
              >
                <BugAntIcon className="h-5 w-5 mr-3" />
                Error Monitor
              </Link>
            </div>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center px-4 py-3.5 text-sm font-black text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-300"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-slate-500 group-hover:text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay Background */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" 
        />
      )}
    </>
  );
}