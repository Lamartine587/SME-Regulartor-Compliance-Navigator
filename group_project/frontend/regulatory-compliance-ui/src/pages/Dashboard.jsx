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
  
  const [allDocs, setAllDocs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token"); 
      if (!token) return navigate("/login");

      // 1. SYNC PROFILE FIRST (For Industry & County context)
      const profileData = await getProfile();
      const bizProfile = {
        business_name: profileData.business_name || "Anga Systems",
        industry: profileData.industry || "General Trade",
        employee_count: profileData.employee_count || 1,
        annual_turnover_kes: profileData.annual_turnover_kes || 0,
        years_in_operation: profileData.years_in_operation || 1,
        county: profileData.county || "Nairobi"
      };

      // 2. FETCH BUSINESS-SPECIFIC COMPLIANCE REPORT
      const complianceRes = await fetch("http://localhost:8000/api/knowledge/compliance/check", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bizProfile)
      });

      // 3. FETCH GENERAL SUMMARY & DOCUMENTS
      const statsRes = await fetch("http://localhost:8000/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const docsRes = await fetch("http://localhost:8000/api/vault/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (complianceRes.ok && statsRes.ok) {
        const report = await complianceRes.json();
        const stats = await statsRes.json();
        
        // Merge the business intelligence (score) with real-time vault stats
        setSummary({
          ...stats,
          compliance_score: report.compliance_score, // Live score based on business type
          total_required_documents: report.total_requirements, // Count from Regulatory Blueprint
          total_expired_or_missing: report.high_priority, // High priority gaps found
          upcoming_expiries: stats.upcoming_expiries || report.upcoming_deadlines
        });
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setAllDocs(docsData.sort((a, b) => b.id - a.id));
      }

      setUserName(profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ""}` : "User");

    } catch (err) {
      console.error("Dashboard Intelligence Sync Error:", err);
      setError("Failed to calculate business compliance roadmap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  // --- LOCAL CALCULATIONS ---
  const businessDocs = allDocs.filter(d => d.category === "business" || !d.category);
  const personalDocs = allDocs.filter(d => d.category === "personal");
  const transactionDocs = allDocs.filter(d => d.category === "transaction");

  const totalFinancialValue = transactionDocs.reduce((sum, doc) => sum + (doc.financial_amount || 0), 0);
  const unpaidInvoicesCount = transactionDocs.filter(d => d.status !== "Paid").length;

  // --- FILTERING LOGIC ---
  let filteredExpiries = summary.upcoming_expiries || [];
  if (globalFilter !== "all") {
    filteredExpiries = filteredExpiries.filter(doc => doc.category === globalFilter || (!doc.category && globalFilter === "business")); 
  }
  
  let filteredUploads = allDocs;
  if (globalFilter !== "all") {
    filteredUploads = filteredUploads.filter(doc => doc.category === globalFilter || (!doc.category && globalFilter === "business"));
  }
  const topRecentUploads = filteredUploads.slice(0, 4);

  const getCategoryIcon = (category) => {
    if (category === "personal") return <UserIcon className="h-4 w-4 mr-1 inline" />;
    if (category === "transaction") return <BanknotesIcon className="h-4 w-4 mr-1 inline" />;
    return <BriefcaseIcon className="h-4 w-4 mr-1 inline" />;
  };

  const renderDashboardCards = () => {
    // Health logic is consistent across views now
    const scoreColor = summary.compliance_score >= 100 ? "text-emerald-600" : summary.compliance_score >= 50 ? "text-amber-500" : "text-rose-600";
    const scoreBg = summary.compliance_score >= 100 ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500";

    switch(globalFilter) {
      case "business":
        return (
          <>
            <DashboardCard title="Business Health">
              <div className="flex items-center justify-between mt-2">
                <p className={`text-4xl font-black ${scoreColor}`}>{summary.compliance_score}%</p>
                <div className={`p-3 rounded-2xl ${scoreBg}`}><BriefcaseIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Required Permits">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-indigo-600">{summary.total_required_documents}</p>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500"><DocumentTextIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Missing or Expired">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-rose-600">{summary.total_expired_or_missing}</p>
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500"><ExclamationTriangleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Active In Vault">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{businessDocs.length}</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><CheckCircleIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
          </>
        );
      case "personal":
        return (
          <>
            <DashboardCard title="Identity Score">
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-600">Verified</p>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500"><ShieldCheckIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Active IDs">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-indigo-600">{personalDocs.length}</p>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500"><IdentificationIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Renewal Alerts">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-amber-500">{filteredExpiries.length}</p>
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><ClockIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Vault Items">
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
            <DashboardCard title="Ledger Value">
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-600">KES {totalFinancialValue.toLocaleString()}</p>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500"><CurrencyDollarIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Liability Risk">
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
            <DashboardCard title="Transaction Count">
              <div className="flex items-center justify-between mt-2">
                <p className="text-4xl font-black text-slate-700 dark:text-slate-300">{transactionDocs.length}</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><ReceiptPercentIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
          </>
        );
      default:
        return (
          <>
            <DashboardCard title="Global Health">
              <div className="flex items-center justify-between mt-2">
                <p className={`text-4xl font-black ${scoreColor}`}>{summary.compliance_score}%</p>
                <div className={`p-3 rounded-2xl ${scoreBg}`}><ShieldCheckIcon className="h-6 w-6" /></div>
              </div>
            </DashboardCard>
            <DashboardCard title="Active Items">
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
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome, <span className="text-indigo-600 dark:text-indigo-400">{userName}</span>
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Real-time intelligence for your business in the {summary.total_required_documents > 0 ? "compliance" : "setup"} phase.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={globalFilter} 
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase px-4 py-2.5 rounded-xl cursor-pointer shadow-sm"
                >
                  <option value="all">Universal View</option>
                  <option value="business">Business Portal</option>
                  <option value="personal">Personal IDs</option>
                  <option value="transaction">Financial Ledger</option>
                </select>
                <button onClick={fetchDashboardData} className="p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-2xl text-sm font-bold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-3" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderDashboardCards()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b dark:border-b-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg uppercase">Timeline & Deadlines</h3>
                </div>
                <div className="p-8 space-y-4">
                  {summary.upcoming_expiries.length > 0 ? summary.upcoming_expiries.map((item) => (
                    <div key={item.id || item.title} className="flex justify-between p-6 bg-slate-50/50 dark:bg-slate-700/30 border dark:border-slate-700 rounded-2xl">
                      <div>
                        <h4 className="font-bold dark:text-white">{item.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.authority}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold dark:text-slate-400">{item.deadline}</p>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.days_remaining <= 7 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {item.days_remaining} days left
                        </span>
                      </div>
                    </div>
                  )) : <p className="text-center text-slate-400">No upcoming expirations.</p>}
                </div>
              </div>

              <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b dark:border-b-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg uppercase">Recent Activity</h3>
                </div>
                <div className="p-8 space-y-4">
                  {topRecentUploads.map((doc) => (
                    <div key={doc.id} className="flex justify-between p-6 bg-slate-50/50 dark:bg-slate-700/30 border dark:border-slate-700 rounded-2xl hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-bold dark:text-white">{doc.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{doc.issuing_authority}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${doc.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {doc.status || "Processing"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}