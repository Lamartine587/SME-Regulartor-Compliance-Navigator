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
  ArrowRightIcon,
  ArrowPathIcon
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

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token"); 

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/dashboard/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        throw new Error("Could not load dashboard data.");
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
                <h1 className="text-3xl font-black text-slate-900">Dashboard Overview</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Live compliance monitoring for Anga Systems.</p>
              </div>
              <button 
                onClick={fetchDashboardSummary}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-bold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                {error}
              </div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Total Permits">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-indigo-600">{summary.total}</p>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Valid Permits">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-emerald-600">{summary.valid}</p>
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Expiring Soon">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-amber-500">{summary.expiring}</p>
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Expired">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-rose-600">{summary.expired}</p>
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                    <XCircleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Upcoming Expiries List */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Upcoming Expiries</h3>
                <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">
                  Action Required
                </span>
              </div>
              
              <div className="p-8">
                <div className="space-y-4">
                  {loading ? (
                    [1, 2].map((i) => (
                      <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl"></div>
                    ))
                  ) : summary.upcomingExpiries?.length > 0 ? (
                    summary.upcomingExpiries.map((permit) => (
                      <div
                        key={permit.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          {/* MAPPING FIX: Use title and issuing_authority */}
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {permit.title}
                          </h4>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                            {permit.issuing_authority}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <p className="text-xs font-bold text-slate-500 mb-1">
                            Expires: <span className="font-mono text-slate-900">{permit.expiry_date}</span>
                          </p>
                          <span
                            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                              permit.days_left <= 7
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : permit.days_left <= 30
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}
                          >
                            {permit.days_left} days remaining
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                      </div>
                      <p className="text-slate-900 font-black">All Clear!</p>
                      <p className="text-sm text-slate-400 mt-1 font-medium">No documents are expiring in the next 90 days.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate("/Permits")}
                  className="w-full mt-8 flex items-center justify-center py-4 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
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