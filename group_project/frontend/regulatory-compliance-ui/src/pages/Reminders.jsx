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
      style: "bg-rose-100 text-rose-700 border-rose-200",
      icon: <ExclamationCircleIcon className="h-4 w-4 mr-1" />,
      bgIcon: <ExclamationCircleIcon className="h-6 w-6 text-rose-500" />,
      bgContainer: "bg-rose-50"
    };
    if (daysRemaining <= 30) return {
      badge: "Urgent",
      style: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <ClockIcon className="h-4 w-4 mr-1" />,
      bgIcon: <ClockIcon className="h-6 w-6 text-amber-500" />,
      bgContainer: "bg-amber-50"
    };
    return {
      badge: "Upcoming",
      style: "bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: <CalendarIcon className="h-4 w-4 mr-1" />,
      bgIcon: <BellIcon className="h-6 w-6 text-indigo-400" />,
      bgContainer: "bg-indigo-50"
    };
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                  <BellIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
                  <p className="text-slate-500 font-medium">Auto-generated compliance alerts and system updates.</p>
                </div>
              </div>
              
              <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Notifications Feed */}
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />
                ))
              ) : reminders.length > 0 ? (
                reminders.map((reminder) => {
                  // BUG FIX: Updated to 'days_remaining' to match backend
                  const styles = getNotificationStyle(reminder.days_remaining);
                  return (
                    <div
                      key={reminder.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                        <div className={`p-3 rounded-xl ${styles.bgContainer}`}>
                           {styles.bgIcon}
                        </div>
                        
                        <div>
                          {/* BUG FIX: Updated to 'title' to match backend */}
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {reminder.title}
                          </h3>
                          <div className="flex items-center mt-1 text-xs text-slate-500 font-medium">
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
                        <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                          {/* Format the ENUM (e.g., KRA_COMPLIANCE_CERTIFICATE -> KRA COMPLIANCE CERTIFICATE) */}
                          {reminder.document_type ? reminder.document_type.replace(/_/g, ' ') : "SYSTEM ALERT"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-4">
                    <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    You have no new alerts. Your compliance is fully up to date.
                  </p>
                </div>
              )}
            </div>

            {/* Proactive Tip Card */}
            <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
               <div className="relative z-10">
                  <h4 className="text-lg font-bold mb-2">Pro-Tip: USSD Reminders</h4>
                  <p className="text-indigo-100 text-sm opacity-90 max-w-lg">
                    Don't forget you can access your compliance status on the go! Dial our USSD code to check expiring permits even without an internet connection.
                  </p>
               </div>
               <div className="absolute top-0 right-0 -mr-8 -mt-8 h-40 w-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}