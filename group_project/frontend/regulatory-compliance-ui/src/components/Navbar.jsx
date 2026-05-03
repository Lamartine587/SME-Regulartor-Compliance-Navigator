import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { getProfile } from "../services/profileService";
import { 
  ChevronDownIcon, 
  ArrowRightOnRectangleIcon, 
  UserIcon, 
  Cog6ToothIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Added 'role' to the user state (default to Customer)
  const [user, setUser] = useState({ name: "SME User", initials: "DCU", role: "Customer" });
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user profile and notifications
  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        // 1. Fetch Profile Data (for Name and Role)
        const profileData = await getProfile();
        if (profileData.first_name) {
          const first = profileData.first_name;
          const last = profileData.last_name || "";
          
          // Get role directly from the backend or localStorage, default to 'customer'
          const rawRole = profileData.role || localStorage.getItem("user_role") || "customer";
          const formattedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

          setUser({
            name: `${first} ${last}`.trim(),
            initials: `${first.charAt(0)}${last ? last.charAt(0) : ""}`.toUpperCase(),
            role: formattedRole
          });
        }

        // 2. Fetch Notifications (Unread Expiry Alerts)
        const token = localStorage.getItem("access_token");
        if (token) {
          const notifRes = await fetch("http://localhost:8000/api/notifications", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            // Filter to only show unread notifications in the dropdown
            setNotifications(notifData.filter(n => !n.is_read));
          }
        }
      } catch (err) {
        console.error("Navbar data fetch failed:", err);
      }
    };
    fetchNavbarData();
  }, []);

  // Handle Logout
  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("user_id"); 
    localStorage.removeItem("user_role");
    navigate("/login"); 
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-3 lg:h-[12%] h-[15%] flex justify-between items-center transition-all">
      
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
        
        {/* --- NOTIFICATIONS DROPDOWN --- */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 rounded-xl transition-all relative ${
              isNotifOpen ? "bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            }`}
          >
            <BellIcon className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-900">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              
              <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 flex justify-between items-center">
                <p className="text-xs text-slate-800 dark:text-white font-black uppercase tracking-widest">Alerts</p>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                  {notifications.length} New
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => { setIsNotifOpen(false); navigate("/reminders"); }}
                      className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {/* Shows the exact required action generated by the backend AI/Scheduler */}
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No pending alerts</p>
                    <p className="text-xs text-slate-400 mt-1">Your compliance is fully up to date!</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => { setIsNotifOpen(false); navigate("/reminders"); }}
                className="w-full p-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-t border-slate-100 dark:border-slate-700 text-center uppercase tracking-widest"
              >
                View Reminders Hub
              </button>
            </div>
          )}
        </div>

        {/* --- PROFILE DROPDOWN --- */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-3 p-1.5 rounded-2xl transition-all duration-200 border ${
              isOpen ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {/* Dynamic Initials */}
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md dark:shadow-indigo-900 shadow-indigo-200">
              {user.initials}
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">{user.name}</p>
              {/* Dynamic Role from DB */}
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                {user.role}
              </p>
            </div>

            <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              
              <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 mb-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">Account Details</p>
              </div>

              <button 
                onClick={() => { navigate("/profile"); setIsOpen(false); }}
                className="flex w-full items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-3 opacity-70" />
                View Profile
              </button>

              <button 
                onClick={() => { navigate("/settings"); setIsOpen(false); }}
                className="flex w-full items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-3 opacity-70" />
                Settings
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>

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