import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  BellIcon, 
  ClockIcon, 
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  SparklesIcon // Added for AI notifications
} from "@heroicons/react/24/outline";

export default function Reminders() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        // Currently fetching from Dashboard summary. 
        // Future IT Upgrade: Change this to `/api/notifications`
        const response = await fetch("http://localhost:8000/api/dashboard/summary", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) throw new Error("Could not load your alerts.");

        const data = await response.json();
        
        // BUG FIX: Updated to match FastAPI's 'upcoming_expiries'
        setReminders(data.upcoming_expiries || []);

      } catch (err) {
        console.error("Reminders Fetch Error:", err);
        setError("Unable to sync reminders with the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [navigate]);

  // Updated to handle standard notifications vs Expiry alerts
  const getNotificationStyle = (daysRemaining) => {
    if (daysRemaining < 0) return {
      badge: "Overdue",
      style: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700/30",
      icon: <ExclamationCircleIcon className="h-4 w-4 mr-1" />,
      bgIcon: <ExclamationCircleIcon className="h-6 w-6 text-rose-500 dark:text-rose-400" />,
      bgContainer: "bg-rose-50 dark:bg-rose-900/20"
    };
    if (daysRemaining <= 30) return {
      badge: "Urgent",
      style: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/30",
      icon: <ClockIcon className="h-4 w-4 mr-1" />,
      bgIcon: <ClockIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
      bgContainer: "bg-amber-50 dark:bg-amber-900/20"
    };
    return {
      badge: "Upcoming",
      style: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700/30",
      icon: <CalendarIcon className="h-4 w-4 mr-1" />,
      bgIcon: <BellIcon className="h-6 w-6 text-indigo-400 dark:text-indigo-300" />,
      bgContainer: "bg-indigo-50 dark:bg-indigo-900/20"
    };
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 dark:bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/50">
                  <BellIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
                  <p className="text-slate-500 dark:text-gray-400 font-medium">Auto-generated compliance alerts and system updates.</p>
                </div>
              </div>
              
              <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-700/30 rounded-2xl text-rose-700 dark:text-rose-400 text-sm font-semibold flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Notifications Feed */}
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl animate-pulse" />
                ))
              ) : reminders.length > 0 ? (
                reminders.map((reminder) => {
                  // BUG FIX: Updated to 'days_remaining' to match backend
                  const styles = getNotificationStyle(reminder.days_remaining);
                  return (
                    <div
                      key={reminder.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50/50 dark:hover:shadow-indigo-900/30 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                        <div className={`p-3 rounded-xl ${styles.bgContainer}`}>
                           {styles.bgIcon}
                        </div>
                        
                        <div>
                          {/* BUG FIX: Updated to 'title' to match backend */}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {reminder.title}
                          </h3>
                          <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-gray-400 font-medium">
                            <CalendarIcon className="h-4 w-4 mr-1.5" />
                            {/* BUG FIX: Updated to 'expiry_date' */}
                            Action required by: {reminder.expiry_date}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:space-y-2">
                        <span className={`flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${styles.style}`}>
                          {styles.icon}
                          {styles.badge}
                        </span>
                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 tracking-wider uppercase">
                          {/* Format the ENUM (e.g., KRA_COMPLIANCE_CERTIFICATE -> KRA COMPLIANCE CERTIFICATE) */}
                          {reminder.document_type ? reminder.document_type.replace(/_/g, ' ') : "SYSTEM ALERT"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-16 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
                    <CheckCircleIcon className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">All caught up!</h3>
                  <p className="text-slate-500 dark:text-gray-400 max-w-xs mx-auto mt-2">
                    You have no new alerts. Your compliance is fully up to date.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}