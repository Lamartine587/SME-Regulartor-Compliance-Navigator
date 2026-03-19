import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  PlusIcon, 
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Permits() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (days) => {
    if (days < 0) return "Expired";
    if (days <= 30) return "Expiring Soon";
    return "Valid";
  };

  useEffect(() => {
    const fetchPermits = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        // NOTE: Adjust this URL if your specific FastAPI route is different
        // Currently pointing to the Document Vault list endpoint from your Swagger docs
        const res = await fetch("http://localhost:8000/api/vault/documents", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("access_token");
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`Failed to load permits (Status: ${res.status})`);
        }

        const data = await res.json();
        // Assuming your backend returns an array of documents/permits
        setPermits(Array.isArray(data) ? data : data.documents || []);
      } catch (err) {
        console.error("Error fetching permits:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPermits();
  }, [navigate]);

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
                <h1 className="text-2xl font-bold text-slate-900">Permit Vault</h1>
                <p className="text-sm text-slate-500 mt-1">Manage and track all your regulatory documents.</p>
              </div>
              
              <button 
                // You can wire this to a modal or a new page later
                onClick={() => console.log("Open Upload Modal")}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Upload Permit
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th scope="col" className="px-6 py-4">Document Name</th>
                      <th scope="col" className="px-6 py-4">Issuing Authority</th>
                      <th scope="col" className="px-6 py-4">Issue Date</th>
                      <th scope="col" className="px-6 py-4">Expiry Date</th>
                      <th scope="col" className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      // Loading Skeletons
                      [1, 2, 3, 4].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="px-6 py-4 flex justify-center"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                        </tr>
                      ))
                    ) : permits.length > 0 ? (
                      // Render Data
                      permits.map((permit) => {
                        const daysLeft = getDaysRemaining(permit.expiryDate);
                        const status = getStatus(daysLeft);

                        return (
                          <tr key={permit.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {permit.name || "Unnamed Document"}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {permit.authority || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {permit.issueDate || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {permit.expiryDate || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full ${
                                  status === "Valid"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : status === "Expiring Soon"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      // Empty State
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium">No permits found</p>
                          <p className="text-slate-400 text-sm mt-1">Upload your first document to get started.</p>
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