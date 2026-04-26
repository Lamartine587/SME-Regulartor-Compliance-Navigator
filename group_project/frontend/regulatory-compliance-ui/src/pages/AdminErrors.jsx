import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { 
  ExclamationCircleIcon, 
  TrashIcon, 
  ArrowPathIcon,
  BugAntIcon
} from "@heroicons/react/24/outline";

export default function AdminErrors() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/admin/errors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all error logs?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch("http://localhost:8000/api/admin/errors", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Helper to colorize status codes
  const getStatusColor = (code) => {
    if (code >= 500) return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700/30"; // Server crashes
    if (code >= 400) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/30"; // User/Auth errors
    return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                  <BugAntIcon className="h-7 w-7 mr-2 text-indigo-600 dark:text-indigo-400" />
                  API Error Monitor
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">System-wide exception tracking.</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={fetchLogs} className="p-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={clearLogs} className="flex items-center px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl border border-rose-100 dark:border-rose-700/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear Logs
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Method & Endpoint</th>
                      <th className="px-6 py-4">Error Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {loading ? (
                       <tr><td colSpan="4" className="p-8 text-center text-slate-400 dark:text-slate-600">Loading logs...</td></tr>
                    ) : logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-[10px] font-black rounded border uppercase ${getStatusColor(log.status_code)}`}>
                              {log.status_code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">{log.method}</span>
                              <span className="font-mono text-xs text-slate-700 dark:text-gray-300">{log.endpoint}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="text-sm font-bold text-slate-800 dark:text-gray-300 truncate">{log.error_detail}</p>
                            {/* If it's a 500 error, you could expand this to show the traceback! */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-700 mb-3" />
                          <p className="text-slate-900 dark:text-white font-bold">No errors logged</p>
                          <p className="text-slate-500 dark:text-gray-400 text-sm">Your APIs are running smoothly!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}