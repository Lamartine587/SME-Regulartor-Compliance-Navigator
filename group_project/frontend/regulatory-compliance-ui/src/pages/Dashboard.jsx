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
  ArrowRightIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); 
  
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

      // Fetch Summary Stats
      const statsRes = await fetch("http://localhost:8000/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch Actual Documents for the Recent Uploads section
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
        // Sort by newest first and grab the top 4
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
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{userName || "User"}</span>
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Here is your real-time compliance status.
                </p>
              </div>
              <button 
                onClick={fetchDashboardData}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-2xl text-sm font-bold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                {error}
              </div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

              <DashboardCard title="Active Permits">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-indigo-600">{summary.total_active_documents}</p>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Missing / Expired">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-rose-600">{summary.total_expired_or_missing}</p>
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Required Categories">
                <div className="flex items-center justify-between mt-2">
                  <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{summary.total_required_documents}</p>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Main Content Grid: Expiries & Recent Docs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Upcoming Expiries List */}
              <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg dark:shadow-slate-800 shadow-slate-200/50 border dark:border-slate-700/50 border-slate-100 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b dark:border-b-slate-700 border-slate-50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="font-black dark:text-white text-slate-800 text-lg uppercase tracking-tight">Priority Renewals</h3>
                  <span className="text-[10px] font-black dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 bg-white border border-slate-200 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">
                    90 Days Out
                  </span>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {loading ? (
                      [1, 2].map((i) => (
                        <div key={i} className="h-20 bg-slate-50 dark:bg-slate-700/50 animate-pulse rounded-2xl"></div>
                      ))
                    ) : summary.upcoming_expiries?.length > 0 ? (
                      summary.upcoming_expiries.map((permit) => (
                        <div
                          key={permit.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex-1 mb-4 sm:mb-0">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {permit.title}
                            </h4>
                            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                              {permit.document_type.replace(/_/g, ' ')}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                              Expires: <span className="font-mono text-slate-900 dark:text-slate-200">{permit.expiry_date}</span>
                            </p>
                            <span
                              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                                permit.days_remaining <= 7
                                  ? "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800"
                                  : permit.days_remaining <= 30
                                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                              }`}
                            >
                              {permit.days_remaining} days left
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircleIcon className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <p className="text-slate-900 dark:text-white font-black">Compliance Maintained</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">No documents are expiring soon.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/reminders")}
                    className="w-full mt-8 flex items-center justify-center py-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-300"
                  >
                    View Alert Hub
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* NEW: Recent Uploads & Manual Review Flags */}
              <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg dark:shadow-slate-800 shadow-slate-200/50 border dark:border-slate-700/50 border-slate-100 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b dark:border-b-slate-700 border-slate-50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="font-black dark:text-white text-slate-800 text-lg uppercase tracking-tight">Recent Uploads</h3>
                  <span className="text-[10px] font-black dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 bg-white border border-slate-200 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">
                    Latest
                  </span>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {loading ? (
                      [1, 2].map((i) => (
                        <div key={i} className="h-20 bg-slate-50 dark:bg-slate-700/50 animate-pulse rounded-2xl"></div>
                      ))
                    ) : recentDocs.length > 0 ? (
                      recentDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 border rounded-2xl transition-all duration-300 group ${
                            doc.document_type === "MANUAL_REVIEW" 
                            ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50" 
                            : "bg-slate-50/50 dark:bg-slate-700/30 border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex-1 mb-4 sm:mb-0">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {doc.title}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                              {doc.issuing_authority || "Processing..."}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            {/* FLAG FOR OCR / AI FAILURE */}
                            {doc.document_type === "MANUAL_REVIEW" ? (
                              <span className="flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Needs Action
                              </span>
                            ) : (
                              <span className="flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Logged
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <DocumentTextIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-900 dark:text-white font-black">No Documents Yet</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">Head to the Vault to upload your first permit.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/permits")}
                    className="w-full mt-8 flex items-center justify-center py-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-300"
                  >
                    Manage Vault
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}