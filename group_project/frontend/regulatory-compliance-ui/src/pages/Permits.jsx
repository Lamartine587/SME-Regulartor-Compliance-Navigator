import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  PlusIcon, 
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function Permits() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  // Logic to calculate status based on NeonDB dates
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (days) => {
    if (days === null) return "Processing";
    if (days < 0) return "Expired";
    if (days <= 30) return "Expiring Soon";
    return "Valid";
  };

  const fetchPermits = async () => {
    setLoading(true);
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/api/vault/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Could not fetch documents");

      const data = await res.json();
      setPermits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, []);

  // BUTTON ACTION: View the PDF from the static backend
  const handleView = (filePath) => {
    if (!filePath) return;
    window.open(`http://localhost:8000/${filePath}`, "_blank");
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Regulatory Permits</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Live tracking of your compliance status.</p>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={fetchPermits}
                  className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg transition-all"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button 
                  // BUTTON ACTION: Navigate to the upload page (DocumentVault)
                  onClick={() => navigate("/Documents")}
                  className="flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Upload
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-bold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-8 py-5">Document Title</th>
                      <th className="px-8 py-5">Issuing Authority</th>
                      <th className="px-8 py-5">Expiry Date</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                        </tr>
                      ))
                    ) : permits.length > 0 ? (
                      permits.map((permit) => {
                        // FIXED MAPPING: Use permit.expiry_date (lowercase_underscore)
                        const daysLeft = getDaysRemaining(permit.expiry_date);
                        const status = getStatus(daysLeft);

                        return (
                          <tr key={permit.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6 font-bold text-slate-800">
                              {permit.title} 
                            </td>
                            <td className="px-8 py-6 text-slate-500 font-medium">
                              {permit.issuing_authority || "AI Processing..."}
                            </td>
                            <td className="px-8 py-6 text-slate-500 font-mono text-xs">
                              {permit.expiry_date || "---"}
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                                status === "Valid" ? "bg-emerald-50 text-emerald-600" : 
                                status === "Expiring Soon" ? "bg-amber-50 text-amber-600" : 
                                status === "Processing" ? "bg-slate-100 text-slate-400" : "bg-rose-50 text-rose-600"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() => handleView(permit.file_path)}
                                className="inline-flex items-center text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl text-xs font-black transition-all"
                              >
                                <EyeIcon className="h-4 w-4 mr-1.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center">
                          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                          <p className="text-slate-900 font-black">No active permits</p>
                          <p className="text-slate-400 text-sm">Upload your compliance documents to start tracking.</p>
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