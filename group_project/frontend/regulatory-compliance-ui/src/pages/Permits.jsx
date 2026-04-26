import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  PlusIcon, 
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
  DocumentArrowUpIcon
} from "@heroicons/react/24/outline";

export default function Permits() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Upload Modal States ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const token = localStorage.getItem("access_token");

  // Date/Status Logic
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
    setError(""); 
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

  const handleView = (filePath) => {
    if (!filePath) return;
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    window.open(`http://localhost:8000/${cleanPath}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/vault/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete the document.");
      setPermits(permits.filter((permit) => permit.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Upload Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(""); // Clear any previous errors
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return setUploadError("Please select a file to upload.");
    }

    setIsUploading(true);
    setUploadError("");

    // We must use FormData to send files to a FastAPI backend
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/api/vault/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
          // Note: DO NOT set 'Content-Type' manually when sending FormData
          // The browser automatically sets it to 'multipart/form-data' with the correct boundary
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload document. Please try again.");

      // Reset modal and refresh the table
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      fetchPermits();

    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Regulatory Permits</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">Live tracking of your compliance status.</p>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={fetchPermits}
                  className="p-2 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all dark:text-slate-300 dark:hover:text-indigo-400"
                  title="Refresh Permits"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button 
                  // Opens the pop-up modal instead of navigating
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg dark:shadow-indigo-900 shadow-indigo-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Upload
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/30 text-rose-700 dark:text-rose-400 p-4 rounded-xl text-sm font-bold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-8 py-5">Document Title</th>
                      <th className="px-8 py-5">Issuing Authority</th>
                      <th className="px-8 py-5">Expiry Date</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {loading ? (
                      [1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div></td>
                        </tr>
                      ))
                    ) : permits.length > 0 ? (
                      permits.map((permit) => {
                        const daysLeft = getDaysRemaining(permit.expiry_date);
                        const status = getStatus(daysLeft);

                        return (
                          <tr key={permit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                            <td className="px-8 py-6 font-bold text-slate-800 dark:text-white">{permit.title}</td>
                            <td className="px-8 py-6 text-slate-500 dark:text-gray-400 font-medium">{permit.issuing_authority || "AI Processing..."}</td>
                            <td className="px-8 py-6 text-slate-500 dark:text-gray-400 font-mono text-xs">{permit.expiry_date || "---"}</td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                                status === "Valid" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : 
                                status === "Expiring Soon" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : 
                                status === "Processing" ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => handleView(permit.file_path)} className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-xl text-xs font-black transition-all dark:hover:bg-indigo-600">
                                  <EyeIcon className="h-4 w-4 mr-1.5" /> View
                                </button>
                                <button onClick={() => handleDelete(permit.id)} className="inline-flex items-center text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-xl text-xs font-black transition-all dark:hover:bg-rose-600">
                                  <TrashIcon className="h-4 w-4 mr-1.5" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center">
                          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-600 mb-4" />
                          <p className="text-slate-900 dark:text-white font-black">No active permits</p>
                          <p className="text-slate-400 dark:text-gray-400 text-sm">Upload your compliance documents to start tracking.</p>
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

      {/* --- POP-UP MODAL OVERLAY --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload Document</h3>
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                  setUploadError("");
                }}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors cursor-pointer relative">
                <DocumentArrowUpIcon className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <label className="cursor-pointer">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black hover:underline text-sm">Browse files</span>
                  <span className="text-slate-500 dark:text-gray-400 text-sm font-medium"> to upload</span>
                  <input 
                    type="file" 
                    accept=".pdf,image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
                <p className="text-xs text-slate-400 dark:text-gray-400 mt-2 font-medium">Supports PDF, PNG, JPG</p>
              </div>

              {selectedFile && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 truncate max-w-[80%]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              {uploadError && (
                <div className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-tighter text-center bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">
                  {uploadError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={!selectedFile || isUploading}
                className={`w-full py-3.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all ${
                  isUploading || !selectedFile 
                    ? "bg-indigo-300 dark:bg-indigo-800 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
                }`}
              >
                {isUploading ? "Uploading & Scanning..." : "Submit to AI Engine"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}