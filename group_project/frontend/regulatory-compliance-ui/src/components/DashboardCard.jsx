import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import { DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ total: 0, valid: 0, expiring: 0, expired: 0, upcomingExpiries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardSummary() {
      try {
        const token = localStorage.getItem("access_token"); 
        const response = await fetch("http://localhost:8000/api/dashboard/summary", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json();
        setSummary(data || {});
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardSummary();
  }, []);

  return (
    // MAIN BACKGROUND IS NOW bg-slate-100
    <div className="flex bg-slate-100 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500 font-medium">Compliance Pulse</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Total" className="border-none shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-black text-blue-600">{loading ? "..." : summary.total}</p>
                  <DocumentTextIcon className="h-8 w-8 text-blue-100" />
                </div>
              </DashboardCard>
              {/* Repeat for Valid, Expiring, Expired using respective colors */}
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-lg">Upcoming Expiries</h3>
              </div>
              <div className="p-8">
                {/* List Logic Here */}
                <button onClick={() => navigate("/permits")} className="w-full mt-6 flex items-center justify-center py-4 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all">
                  Manage All Permits <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}