import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  BanknotesIcon, 
  PlusIcon, 
  XMarkIcon, 
  DocumentArrowUpIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// Financial-specific document types
const TRANSACTION_TYPES = [
  { value: "invoice", label: "Tax Invoice" },
  { value: "delivery_note", label: "Delivery Note" },
  { value: "receipt", label: "Receipt" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "OTHER", label: "Other Financial" }
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Upload Modal States ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState(TRANSACTION_TYPES[0].value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/vault/documents", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter strictly for transactions
        const filtered = data.filter(doc => doc.category?.toLowerCase() === "transaction");
        setTransactions(filtered.sort((a, b) => b.id - a.id));
      }
    } catch (err) {
      setError("Failed to sync ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- Handlers ---
  const handleView = (filePath) => {
    if (!filePath) return;
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    window.open(`http://localhost:8000/${cleanPath}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction record?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/vault/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim()) {
      return setUploadError("Provide a title and select a file.");
    }

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", docTitle);
    formData.append("document_type", docType);
    formData.append("category", "transaction"); // STICKY CATEGORY

    try {
      const res = await fetch("http://localhost:8000/api/vault/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      // Reset and refresh
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setDocTitle("");
      fetchTransactions();
    } catch (err) {
      setUploadError("Verification failed. Check file clarity.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Ledger</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage your invoices, receipts, and delivery notes.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={fetchTransactions} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Upload Document
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-widest text-slate-400">
                      <th className="p-5 font-black">Document Details</th>
                      <th className="p-5 font-black">Vendor / Supplier</th>
                      <th className="p-5 font-black text-right">Amount (KES)</th>
                      <th className="p-5 font-black text-center">Status</th>
                      <th className="p-5 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400 animate-pulse font-bold">Syncing Ledger...</td></tr>
                    ) : transactions.length > 0 ? (
                      transactions.map((doc) => (
                        <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="p-5">
                            <p className="font-bold text-slate-900 dark:text-white">{doc.title}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{doc.document_type.replace(/_/g, ' ')}</p>
                          </td>
                          <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-300">{doc.issuing_authority || "Unknown"}</td>
                          <td className="p-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {doc.financial_amount ? doc.financial_amount.toLocaleString() : "—"}
                          </td>
                          <td className="p-5 text-center">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                              doc.expiry_date && new Date(doc.expiry_date) < new Date() ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {doc.expiry_date && new Date(doc.expiry_date) < new Date() ? "Overdue" : "Valid"}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => handleView(doc.file_path)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="View"><EyeIcon className="h-5 w-5" /></button>
                               <button onClick={() => handleDelete(doc.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Delete"><TrashIcon className="h-5 w-5" /></button>
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-20 text-center">
                          <BanknotesIcon className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                          <p className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-widest">No Financial Records</p>
                          <p className="text-slate-500 text-xs mt-1">Upload your first invoice to begin tracking.</p>
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

      {/* --- UPLOAD MODAL --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-[0.2em]">Upload Transaction</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><XMarkIcon className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Document Title</label>
                <input 
                  type="text" 
                  value={docTitle} 
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance Invoice"
                  className="w-full border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Document Type</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none text-sm font-bold cursor-pointer"
                >
                  {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-300 transition-all cursor-pointer relative group">
                <DocumentArrowUpIcon className="h-10 w-10 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <label className="cursor-pointer">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mb-1">Upload Financial PDF</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                </label>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                     <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate">{selectedFile.name}</p>
                  </div>
                )}
              </div>

              {uploadError && <p className="text-[10px] font-black text-rose-500 uppercase text-center bg-rose-50 p-2 rounded-lg">{uploadError}</p>}

              <button 
                type="submit" 
                disabled={isUploading || !selectedFile}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                {isUploading ? "Verifying Transaction..." : "Submit to Ledger"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}