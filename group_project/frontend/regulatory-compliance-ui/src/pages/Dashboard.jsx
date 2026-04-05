import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import { getProfile } from "../services/profileService"; 
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ClockIcon,
  ShieldCheckIcon // Added a shield icon for the compliance score
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); 
  
  // 1. Updated State to match your new FastAPI DashboardSummary Schema
  const [summary, setSummary] = useState({
    compliance_score: 0,
    total_required_documents: 0,
    total_active_documents: 0,
    total_expired_or_missing: 0,
    upcoming_expiries: []
  });
  
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token"); 

      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch Summary Stats (Your newly updated backend route)
      const statsRes = await fetch("http://localhost:8000/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch Actual Documents for the bottom section
      const docsRes = await fetch("http://localhost:8000/api/vault/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = await getProfile();
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setSummary(statsData);
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        const sortedDocs = docsData.sort((a, b) => b.id - a.id).slice(0, 4);
        setRecentDocs(sortedDocs);
      }

      if (profileData.first_name) {
        setUserName(`${profileData.first_name} ${profileData.last_name || ""}`);
      } else {
        setUserName("User");
      }

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Welcome back, <span className="text-indigo-600">{userName || "User"}</span>
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Here is your real-time compliance status.
                </p>
              </div>
              <button 
                onClick={fetchDashboardData}
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

            {/* 2. Top Summary Cards Mapped to New Backend Variables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Compliance Score Card */}
              <DashboardCard title="Compliance Score">
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-4xl font-black ${summary.compliance_score >= 100 ? "text-emerald-600" : summary.compliance_score >= 50 ? "text-amber-500" : "text-rose-600"}`}>
                    {summary.compliance_score}%
                  </p>
                  <div className={`p-3 rounded-2xl ${summary.compliance_score >= 100 ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500"}`}>
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              {/* Active Permits */}
              <DashboardCard title="Active Permits">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-indigo-600">{summary.total_active_documents}</p>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              {/* Expired or Missing */}
              <DashboardCard title="Missing / Expired">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-rose-600">{summary.total_expired_or_missing}</p>
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              {/* Total Required Types */}
              <DashboardCard title="Required Categories">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-slate-700">{summary.total_required_documents}</p>
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-500">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* 3. Upcoming Expiries List */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Priority Renewals (90 Days)</h3>
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
                  ) : summary.upcoming_expiries?.length > 0 ? (
                    summary.upcoming_expiries.map((permit) => (
                      <div
                        key={permit.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {permit.title}
                          </h4>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                            {/* Format the enum string to be readable (e.g., KRA_COMPLIANCE_CERTIFICATE -> KRA COMPLIANCE CERTIFICATE) */}
                            {permit.document_type.replace(/_/g, ' ')}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <p className="text-xs font-bold text-slate-500 mb-1">
                            Expires: <span className="font-mono text-slate-900">{permit.expiry_date}</span>
                          </p>
                          <span
                            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                              permit.days_remaining <= 7
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : permit.days_remaining <= 30
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}
                          >
                            {/* Updated from days_left to days_remaining based on your schema */}
                            {permit.days_remaining} days left
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                      </div>
                      <p className="text-slate-900 font-black">Compliance Maintained</p>
                      <p className="text-sm text-slate-400 mt-1 font-medium">No documents are expiring in the next 90 days.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate("/permits")}
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