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
  ClockIcon,
  BanknotesIcon,
  UserIcon,
  BriefcaseIcon,
  IdentificationIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); 
  
  // Master Context Switcher
  const [globalFilter, setGlobalFilter] = useState("all"); 
  const [expirySort, setExpirySort] = useState("urgent");
  const [uploadFilter, setUploadFilter] = useState("all");

  const [summary, setSummary] = useState({
    compliance_score: 0,
    total_required_documents: 0,
    total_active_documents: 0,
    total_expired_or_missing: 0,
    upcoming_expiries: []
  });
  
  const [allDocs, setAllDocs] = useState([]); // Store all docs for local calculations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token"); 

      if (!token) return navigate("/login");

      const statsRes = await fetch("http://localhost:8000/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const docsRes = await fetch("http://localhost:8000/api/vault/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = await getProfile();
      
      if (statsRes.ok) setSummary(await statsRes.json());

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setAllDocs(docsData.sort((a, b) => b.id - a.id));
      }

      if (profileData.personal?.first_name || profileData.first_name) {
        setUserName(`${profileData.personal?.first_name || profileData.first_name} ${profileData.personal?.last_name || profileData.last_name || ""}`);
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

  // --- LOCAL CALCULATIONS FOR DYNAMIC CARDS ---
  const businessDocs = allDocs.filter(d => d.category === "business" || !d.category);
  const personalDocs = allDocs.filter(d => d.category === "personal");
  const transactionDocs = allDocs.filter(d => d.category === "transaction");

  // Transaction specific math
  const totalFinancialValue = transactionDocs.reduce((sum, doc) => sum + (doc.financial_amount || 0), 0);
  const unpaidInvoicesCount = transactionDocs.filter(d => d.status !== "Paid").length;

  // --- FILTERING LOGIC FOR LISTS ---
  let filteredExpiries = summary.upcoming_expiries || [];
  if (globalFilter !== "all") {
    filteredExpiries = filteredExpiries.filter(doc => doc.category === globalFilter || (!doc.category && globalFilter === "business")); 
  }
  if (expirySort === "urgent") {
    filteredExpiries.sort((a, b) => a.days_remaining - b.days_remaining);
  } else if (expirySort === "latest") {
    filteredExpiries.sort((a, b) => b.days_remaining - a.days_remaining);
  }

  let filteredUploads = allDocs;
  if (globalFilter !== "all") {
    filteredUploads = filteredUploads.filter(doc => doc.category === globalFilter || (!doc.category && globalFilter === "business"));
  }
  if (uploadFilter !== "all") {
    filteredUploads = filteredUploads.filter(doc => doc.document_type === uploadFilter || doc.status === uploadFilter);
  }
  const topRecentUploads = filteredUploads.slice(0, 4); // Only show top 4

  const getCategoryIcon = (category) => {
    if (category === "personal") return <UserIcon className="h-4 w-4 mr-1 inline" />;
    if (category === "transaction") return <BanknotesIcon className="h-4 w-4 mr-1 inline" />;
    return <BriefcaseIcon className="h-4 w-4 mr-1 inline" />;
  };

  // --- DYNAMIC CARD RENDERER ---
  const renderDashboardCards = () => {
    switch(globalFilter) {
      case "business":
        return (
          <>
            <DashboardCard title="Business Health">
              <div className="flex items-center justify-between mt-2">
                <p className={`text-4xl font-black ${summary.compliance_score >= 100 ? "text-emerald-600" : summary.compliance_score >= 50 ? "text-amber-500" : "text-rose-600"}`}>
                  {summary.compliance_score}%
                </p>
                <div className={`p-3 rounded-2xl ${summary.compliance_score >= 100 ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500"}`}>
                  <BriefcaseIcon className="h-6 w-6" />
                </div>
              </div>
            </DashboardCard>
            <DashboardCard title="Active Permits">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-indigo-600">{businessDocs.length}</p>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500"><CheckCircleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Critical Renewals">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-rose-600">{filteredExpiries.filter(d => d.days_remaining <= 30).length}</p>
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500"><ExclamationTriangleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="All Corporate Docs">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{businessDocs.length}</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><DocumentDuplicateIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
          </>
        );
      case "personal":
        return (
          <>
            <DashboardCard title="Identity Status">
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-600">Verified</p>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500"><ShieldCheckIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Active Licenses">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-indigo-600">{personalDocs.length}</p>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500"><IdentificationIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Expiring IDs">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-amber-500">{filteredExpiries.length}</p>
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><ClockIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Personal Vault">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{personalDocs.length}</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><UserIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
          </>
        );
      case "transaction":
        return (
          <>
            <DashboardCard title="Total Ledger Value">
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-600">KES {totalFinancialValue.toLocaleString()}</p>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500"><CurrencyDollarIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Unpaid Invoices">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-rose-600">{unpaidInvoicesCount}</p>
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500"><ExclamationTriangleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Upcoming Dues">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-amber-500">{filteredExpiries.length}</p>
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><ClockIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Total Transactions">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{transactionDocs.length}</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><ReceiptPercentIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
          </>
        );
        default: // "all"
        return (
          <>
            <DashboardCard title="Global Health Score">
              <div className="flex items-center justify-between mt-2">
                <p className={`text-4xl font-black ${summary.compliance_score >= 100 ? "text-emerald-600" : summary.compliance_score >= 50 ? "text-amber-500" : "text-rose-600"}`}>
                  {summary.compliance_score}%
                </p>
                <div className={`p-3 rounded-2xl ${summary.compliance_score >= 100 ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500"}`}>
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
              </div> {/* <-- THIS IS THE MISSING DIV! */}
            </DashboardCard>
            
            <DashboardCard title="Active Vault Items">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-indigo-600">{summary.total_active_documents}</p>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500"><CheckCircleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Needs Attention">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-rose-600">{summary.total_expired_or_missing}</p>
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500"><ExclamationTriangleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Total Required">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{summary.total_required_documents}</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><DocumentTextIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
          </>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header with Global Dropdown */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{userName || "User"}</span>
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Here is your real-time {globalFilter !== "all" ? globalFilter : "universal"} status.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={globalFilter} 
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm"
                >
                  <option value="all">Universal View</option>
                  <option value="business">Business Portal</option>
                  <option value="personal">Personal IDs</option>
                  <option value="transaction">Financial Ledger</option>
                </select>

                <button 
                  onClick={fetchDashboardData}
                  className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-2xl text-sm font-bold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                {error}
              </div>
            )}

            {/* DYNAMIC TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderDashboardCards()}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Upcoming Expiries & Due Dates List */}
              <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg dark:shadow-slate-800 shadow-slate-200/50 border dark:border-slate-700/50 border-slate-100 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b dark:border-b-slate-700 border-slate-50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="font-black dark:text-white text-slate-800 text-lg uppercase tracking-tight">Timeline & Expiries</h3>
                  
                  <select 
                    value={expirySort} 
                    onChange={(e) => setExpirySort(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="urgent">Most Urgent</option>
                    <option value="latest">Farthest Out</option>
                  </select>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {loading ? (
                      [1, 2].map((i) => (
                        <div key={i} className="h-20 bg-slate-50 dark:bg-slate-700/50 animate-pulse rounded-2xl"></div>
                      ))
                    ) : filteredExpiries.length > 0 ? (
                      filteredExpiries.map((permit) => (
                        <div
                          key={permit.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex-1 mb-4 sm:mb-0">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {permit.title}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                              {getCategoryIcon(permit.category)} {permit.document_type?.replace(/_/g, ' ')}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                              {permit.category === "transaction" ? "Due:" : "Expires:"} <span className="font-mono text-slate-900 dark:text-slate-200">{permit.expiry_date}</span>
                            </p>
                            <span
                              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                                permit.days_remaining < 0
                                  ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                  : permit.days_remaining <= 7
                                  ? "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800"
                                  : permit.days_remaining <= 30
                                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                              }`}
                            >
                              {permit.days_remaining < 0 ? `Overdue by ${Math.abs(permit.days_remaining)} days` : `${permit.days_remaining} days left`}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircleIcon className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <p className="text-slate-900 dark:text-white font-black">All Clear</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">No deadlines match this filter.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/reminders")}
                    className="w-full mt-8 flex items-center justify-center py-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
                  >
                    View Alert Hub
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Recent Uploads */}
              <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg dark:shadow-slate-800 shadow-slate-200/50 border dark:border-slate-700/50 border-slate-100 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b dark:border-b-slate-700 border-slate-50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="font-black dark:text-white text-slate-800 text-lg uppercase tracking-tight">Recent Activity</h3>
                  
                  <select 
                    value={uploadFilter} 
                    onChange={(e) => setUploadFilter(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="MANUAL_REVIEW">Needs Review</option>
                  </select>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {loading ? (
                      [1, 2].map((i) => (
                        <div key={i} className="h-20 bg-slate-50 dark:bg-slate-700/50 animate-pulse rounded-2xl"></div>
                      ))
                    ) : topRecentUploads.length > 0 ? (
                      topRecentUploads.map((doc) => (
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
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                              {getCategoryIcon(doc.category)} {doc.issuing_authority || "Processing..."}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            {doc.document_type === "MANUAL_REVIEW" ? (
                              <span className="flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Action Needed
                              </span>
                            ) : doc.category === "transaction" && doc.financial_amount ? (
                               <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                KES {doc.financial_amount.toLocaleString()}
                               </span>
                            ) : (
                              <span className="flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {doc.status || "Logged"}
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
                        <p className="text-slate-900 dark:text-white font-black">No Recent Uploads</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">Match not found for this filter.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/permits")}
                    className="w-full mt-8 flex items-center justify-center py-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
                  >
                    Open Vault
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