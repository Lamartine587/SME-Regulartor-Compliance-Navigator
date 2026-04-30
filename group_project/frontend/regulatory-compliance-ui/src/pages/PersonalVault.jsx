import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  UserIcon, 
  IdentificationIcon, 
  PlusIcon, 
  XMarkIcon, 
  DocumentArrowUpIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// Categorization for Personal Documents
const PERSONAL_DOC_TYPES = [
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
  { value: "PASSPORT", label: "Passport" },
  { value: "ACADEMIC_CERTIFICATE", label: "Academic Certificate" },
  { value: "PROFESSIONAL_CERT", label: "Professional Certification" },
  { value: "BIRTH_CERTIFICATE", label: "Birth Certificate" },
  { value: "OTHER", label: "Other ID/Credential" }
];

export default function PersonalVault() {
  const [personalDocs, setPersonalDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Upload Modal States ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState(PERSONAL_DOC_TYPES[0].value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const token = localStorage.getItem("access_token");

  // --- Fetching Logic ---
  const fetchPersonalDocs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/vault/documents", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch documents.");
      
      const data = await res.json();
      // STRICT FILTER: Only personal documents
      const filtered = data.filter(doc => doc.category === "personal");
      setPersonalDocs(filtered.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalDocs();
  }, []);

  // --- Handlers ---
  const handleView = (filePath) => {
    if (!filePath) return;
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    window.open(`http://localhost:8000/${cleanPath}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this credential?")) return;
    try {
      await fetch(`http://localhost:8000/api/vault/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersonalDocs(personalDocs.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim()) {
      return setUploadError("Provide a title and a file (PDF/Image).");
    }

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", docTitle);
    formData.append("document_type", docType);
    formData.append("category", "personal"); // Essential for Dashboard separation

    try {
      const res = await fetch("http://localhost:8000/api/vault/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Processing failed.");

      // Reset and Close
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setDocTitle("");
      fetchPersonalDocs();
    } catch (err) {
      setUploadError("AI Scan failed. Please try a clearer file.");
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
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Personal Identity Vault</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage your IDs and Certifications securely.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchPersonalDocs} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all"
                >
                  <PlusIcon className="h-5 w-5 mr-2" /> Add Credential
                </button>
              </div>
            </div>

            {/* Grid of Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center py-20 font-black text-slate-300 uppercase tracking-widest animate-pulse">Syncing Vault...</div>
              ) : personalDocs.length > 0 ? (
                personalDocs.map((doc) => (
                  <div key={doc.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group relative overflow-hidden">
                    <IdentificationIcon className="absolute -right-6 -bottom-6 h-32 w-32 text-slate-50 dark:text-slate-900/40 transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                          <UserIcon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full">
                          {doc.document_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{doc.title}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">{doc.issuing_authority || "Authority Unknown"}</p>
                      
                      <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expires</p>
                          <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{doc.expiry_date || "Lifetime"}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleView(doc.file_path)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><EyeIcon className="h-5 w-5" /></button>
                           <button onClick={() => handleDelete(doc.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-24 bg-white dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                  <IdentificationIcon className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-tight">Identity Vault Empty</p>
                  <p className="text-slate-500 text-sm mt-1">Upload your National ID or Driver's License to start.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* --- UPLOAD MODAL --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-[0.2em]">Add Credential</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><XMarkIcon className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Document Label</label>
                <input 
                  type="text" 
                  value={docTitle} 
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. My Driving License"
                  className="w-full border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Classification</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none text-sm font-bold cursor-pointer"
                >
                  {PERSONAL_DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* DYNAMIC FILE PICKER (PDF, PNG, JPG) */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-300 transition-all cursor-pointer relative group">
                <DocumentArrowUpIcon className="h-10 w-10 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <label className="cursor-pointer">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mb-1">Click to browse media</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PDF, PNG, or JPG</span>
                  <input 
                    type="file" 
                    accept=".pdf, image/png, image/jpeg, image/jpg" // TARGETED ACCEPTANCE
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                  />
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
                {isUploading ? "Scanning Document..." : "Verify & Save to Vault"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}