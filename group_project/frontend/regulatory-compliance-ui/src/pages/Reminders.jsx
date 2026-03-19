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
  FunnelIcon
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

        // Adjust this URL to match your specific reminders or notifications endpoint
        const response = await fetch("http://localhost:8000/api/dashboard/summary", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) throw new Error("Could not load your alerts.");

        const data = await response.json();
        // Using upcomingExpiries as the data source for reminders
        setReminders(data.upcomingExpiries || []);

      } catch (err) {
        console.error("Reminders Fetch Error:", err);
        setError("Unable to sync reminders with the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [navigate]);

  const getStatusBadge = (daysLeft) => {
    if (daysLeft < 0) return {
      text: "Overdue",
      style: "bg-rose-100 text-rose-700 border-rose-200",
      icon: <ExclamationCircleIcon className="h-4 w-4 mr-1" />
    };
    if (daysLeft <= 30) return {
      text: "Urgent",
      style: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <ClockIcon className="h-4 w-4 mr-1" />
    };
    return {
      text: "Upcoming",
      style: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <CalendarIcon className="h-4 w-4 mr-1" />
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
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reminders</h1>
                  <p className="text-slate-500 font-medium">Auto-generated compliance alerts for your SME.</p>
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

            {/* Reminders Feed */}
            <div className="space-y-4">
              {loading ? (
                // Loading Skeletons
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />
                ))
              ) : reminders.length > 0 ? (
                reminders.map((reminder) => {
                  const status = getStatusBadge(reminder.daysLeft);
                  return (
                    <div
                      key={reminder.id}
                      className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-5">
                        <div className={`p-3 rounded-xl ${reminder.daysLeft <= 30 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                           {reminder.daysLeft <= 30 ? (
                             <ExclamationCircleIcon className="h-6 w-6 text-rose-500" />
                           ) : (
                             <BellIcon className="h-6 w-6 text-slate-400" />
                           )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {reminder.name} Renewal
                          </h3>
                          <div className="flex items-center mt-1 text-sm text-slate-500 font-medium">
                            <CalendarIcon className="h-4 w-4 mr-1.5" />
                            Due: {reminder.expiryDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span className={`flex items-center px-3 py-1 text-xs font-bold rounded-full border ${status.style}`}>
                          {status.icon}
                          {status.text}
                        </span>
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                          {reminder.authority}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty State
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-4">
                    <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    No urgent compliance deadlines or reminders found at the moment.
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