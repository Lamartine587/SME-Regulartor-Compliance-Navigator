import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { getProfile } from "../services/profileService";
import { 
  ChevronDownIcon, 
  ArrowRightOnRectangleIcon, 
  UserIcon, 
  Cog6ToothIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: "SME Admin", initials: "SA" });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data for the navbar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        if (data.first_name) {
          const first = data.first_name;
          const last = data.last_name || "";
          
          setUser({
            name: `${first} ${last}`.trim(),
            // Generate initials dynamically
            initials: `${first.charAt(0)}${last ? last.charAt(0) : ""}`.toUpperCase()
          });
        }
      } catch (err) {
        console.error("Navbar profile fetch failed:", err);
      }
    };
    fetchUser();
  }, []);

  // Handle Logout
  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("user_id"); // Clean up local storage
    navigate("/login"); 
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
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-3 lg:h-16 flex justify-between items-center transition-all">
      
      {/* Left side: Breadcrumb */}
      <div className="hidden md:block">
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center">
          SME Navigator 
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold tracking-tight">Management Console</span>
        </p>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center space-x-4 ml-auto">
        
        {/* Notifications Icon */}
        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-xl transition-all relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-3 p-1.5 rounded-2xl transition-all duration-200 border ${
              isOpen ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {/* Dynamic Initials based on Name */}
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-200">
              {user.initials}
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Administrator</p>
            </div>

            <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              
              <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 mb-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">Account Details</p>
              </div>

              {/* View Profile Button - Now Functional */}
              <button 
                onClick={() => { navigate("/profile"); setIsOpen(false); }}
                className="flex w-full items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-3 opacity-70" />
                View Profile
              </button>

              {/* Settings Button - Now Functional */}
              <button 
                onClick={() => { navigate("/settings"); setIsOpen(false); }}
                className="flex w-full items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-3 opacity-70" />
                Settings
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/50 font-bold transition-colors"
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