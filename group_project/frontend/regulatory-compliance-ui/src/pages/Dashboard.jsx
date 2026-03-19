import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total: 0,
    valid: 0,
    expiring: 0,
    expired: 0,
    upcomingExpiries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardSummary() {
      try {
        // MATCHING THE KEY FROM authService.js
        const token = localStorage.getItem("access_token"); 

        if (!token) {
          navigate("/login");
          return;
        }

        // HITTING THE CORRECT FASTAPI PORT (8000)
        const response = await fetch(
          "http://localhost:8000/api/dashboard/summary",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("access_token");
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`Failed to load data (Status: ${response.status})`);
        }

        const data = await response.json();
        setSummary(data || {});
      } catch (err) {
        console.error("Error fetching dashboard summary:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardSummary();
  }, [navigate]);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Track and manage your SME compliance status.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Total Permits">
                <div className="flex items-center justify-between mt-2">
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-blue-600">{summary.total || 0}</p>
                  )}
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Valid Permits">
                <div className="flex items-center justify-between mt-2">
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-emerald-600">{summary.valid || 0}</p>
                  )}
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Expiring Soon">
                <div className="flex items-center justify-between mt-2">
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-amber-500">{summary.expiring || 0}</p>
                  )}
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Expired">
                <div className="flex items-center justify-between mt-2">
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-rose-600">{summary.expired || 0}</p>
                  )}
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                    <XCircleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Upcoming Expiries List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Upcoming Expiries</h3>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    // Loading Skeleton
                    [1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 w-48 bg-slate-200 rounded"></div>
                          <div className="h-3 w-32 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                      </div>
                    ))
                  ) : summary.upcomingExpiries?.length > 0 ? (
                    // Render Active Data
                    summary.upcomingExpiries.map((permit) => (
                      <div
                        key={permit.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all duration-200 group"
                      >
                        <div className="flex-1 mb-2 sm:mb-0">
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {permit.name}
                          </h4>
                          <p className="text-sm text-slate-500 flex items-center mt-1">
                            {permit.authority}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <p className="text-sm font-medium text-slate-700">
                            Expires: {permit.expiryDate}
                          </p>
                          <span
                            className={`mt-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                              permit.daysLeft <= 30
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : permit.daysLeft <= 60
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {permit.daysLeft} days left
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Empty State
                    <div className="text-center py-10">
                      <CheckCircleIcon className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-slate-900 font-medium">You're all set!</p>
                      <p className="text-sm text-slate-500 mt-1">No permits are expiring in the next 90 days.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate("/permits")}
                  className="w-full mt-6 flex items-center justify-center py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  Manage All Permits
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}