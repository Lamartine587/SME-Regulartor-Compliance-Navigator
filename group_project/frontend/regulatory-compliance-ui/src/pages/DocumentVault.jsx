import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function DocumentVault() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = localStorage.getItem("access_token");
  const API_BASE = "http://localhost:8000/api/vault/documents";

  // 1. Fetch documents (Matches your backend's List Response)
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not load documents");
      const data = await response.json();
      setDocuments(data); // FastAPI returns a list [doc, doc]
    } catch (error) {
      console.error("Vault Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Drag & Drop Logic
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  // 3. Fixed Upload Logic (Squashes the 422 Error)
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Loop through each file because backend handles one at a time
      for (const file of selectedFiles) {
        const formData = new FormData();
        
        // CRITICAL: These keys must match your Python FastAPI arguments exactly
        formData.append("file", file); // Backend expects 'file: UploadFile'
        formData.append("title", file.name); // Backend expects 'title: str'
        formData.append("document_type", "Compliance Certificate"); // Backend expects 'document_type: str'
        formData.append("issuing_authority", "Self Uploaded");

        const response = await fetch(API_BASE, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}` 
            // Note: Content-Type is NOT set manually. Browser does it for FormData.
          },
          body: formData,
        });

        if (!response.ok) {
          const errorDetail = await response.json();
          console.error("FastAPI 422/500 Detail:", errorDetail);
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      setMessage({ text: "Vault updated successfully!", type: "success" });
      setSelectedFiles([]);
      fetchDocuments(); // Refresh the list from DB
    } catch (error) {
      setMessage({ text: error.message || "Upload failed. Check console.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Document Vault</h1>
                <p className="text-slate-500 dark:text-gray-400 font-medium mt-1">Encrypted storage for your regulatory certificates.</p>
              </div>
              <button onClick={fetchDocuments} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700 p-8">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center ${
                  dragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.01]" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50"
                }`}
              >
                <CloudArrowUpIcon className={`h-12 w-12 mb-4 ${dragActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-600"}`} />
                <p className="text-slate-600 dark:text-gray-300 font-bold">Drag & drop files here, or click to browse</p>
                <p className="text-slate-400 dark:text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">PDF, PNG, JPG up to 10MB</p>

                <label className="absolute inset-0 w-full h-full cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={(e) => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])} 
                  />
                </label>
              </div>

              {/* Selection Summary */}
              {selectedFiles.length > 0 && (
                <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Queue</h3>
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300 truncate max-w-[250px]">{file.name}</span>
                      </div>
                      <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full mt-6 bg-indigo-600 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 disabled:bg-slate-300 dark:disabled:bg-slate-700 active:scale-[0.98]"
                  >
                    {uploading ? "Uploading to Vault..." : `Securely Upload ${selectedFiles.length} File(s)`}
                  </button>
                </div>
              )}

              {message.text && (
                <div className={`mt-6 p-4 rounded-2xl flex items-center text-sm font-bold ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-700/30'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-700/30'
                }`}>
                  {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-3" /> : <ExclamationCircleIcon className="h-5 w-5 mr-3" />}
                  {message.text}
                </div>
              )}
            </div>

            {/* Database Stored Files */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-700/30">
                <h2 className="text-lg font-black text-slate-800 dark:text-white">Your Records</h2>
                <span className="text-[10px] font-black px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  {documents.length} Files
                </span>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {loading ? (
                  <div className="p-20 text-center text-slate-300 dark:text-slate-600 font-bold italic animate-pulse">Synchronizing with Vault...</div>
                ) : documents.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                       <DocumentIcon className="h-10 w-10 text-slate-200 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-black">No documents found.</p>
                    <p className="text-slate-400 dark:text-gray-400 text-sm mt-1">Your compliance files will appear here once uploaded.</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                      <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all">
                          <DocumentIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mt-0.5">{doc.document_type}</p>
                        </div>
                      </div>

                      <a
                        href={`http://localhost:8000/${doc.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 text-xs font-black bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2.5 rounded-xl transition-all"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>VIEW</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}