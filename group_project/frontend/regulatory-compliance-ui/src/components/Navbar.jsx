import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { 
  ChevronDownIcon, 
  ArrowRightOnRectangleIcon, 
  UserIcon, 
  Cog6ToothIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = () => {
    removeToken();
    // FIXED: Changed from "/login" to "/SignIn" to match App.jsx
    navigate("/SignIn"); 
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 lg:h-16 flex justify-between items-center transition-all">
      
      {/* Left side: Page context or Breadcrumb */}
      <div className="hidden md:block">
        <p className="text-slate-500 font-medium text-sm flex items-center">
          SME Navigator 
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900 font-bold tracking-tight">Management Console</span>
        </p>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center space-x-4 ml-auto">
        
        {/* Notifications Icon */}
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-3 p-1.5 rounded-2xl transition-all duration-200 border ${
              isOpen ? "bg-slate-50 border-slate-200 shadow-sm" : "border-transparent hover:bg-slate-50"
            }`}
          >
            {/* User Avatar with Initials (Don Kipkoech) */}
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-200">
              DK
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">Don Kipkoech</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">IT Administrator</p>
            </div>

            <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Account Details</p>
              </div>

              <button className="flex w-full items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <UserIcon className="h-4 w-4 mr-3 opacity-70" />
                View Profile
              </button>

              <button className="flex w-full items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <Cog6ToothIcon className="h-4 w-4 mr-3 opacity-70" />
                Settings
              </button>

              <div className="h-px bg-slate-100 my-1 mx-2"></div>

              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}