import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function DocumentVault() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = localStorage.getItem("access_token"); // Updated Key
  const API_BASE = "http://localhost:8000/api/vault/documents"; // Updated Port

  // Fetch documents from backend
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Drag and Drop Logic
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

  const removeSelectedFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Upload Logic
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setMessage({ text: "", type: "" });
    
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      // 'files' must match the parameter name in your FastAPI endpoint
      formData.append("files", file); 
    });

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        // IMPORTANT: Do NOT set Content-Type header when sending FormData
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setMessage({ text: "Documents uploaded successfully!", type: "success" });
      setSelectedFiles([]);
      fetchDocuments(); // Refresh list
    } catch (error) {
      setMessage({ text: "Failed to upload files. Check backend logs.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
              <p className="text-slate-500 mt-1">Securely store and manage your business compliance certificates.</p>
            </div>

            {/* Upload Zone */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-200 flex flex-col items-center justify-center ${
                  dragActive ? "border-indigo-500 bg-indigo-50 scale-[1.01]" : "border-slate-300 bg-slate-50"
                }`}
              >
                <CloudArrowUpIcon className={`h-12 w-12 mb-4 ${dragActive ? "text-indigo-600" : "text-slate-400"}`} />
                <p className="text-slate-600 font-medium">Drag & drop files here, or click to browse</p>
                <p className="text-slate-400 text-sm mt-1">PDF, PNG, JPG (Max 10MB each)</p>

                <label className="absolute inset-0 w-full h-full cursor-pointer">
                  <input type="file" className="hidden" multiple onChange={(e) => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])} />
                </label>
              </div>

              {/* Selection List */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Ready to upload</h3>
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="h-5 w-5 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button onClick={() => removeSelectedFile(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:bg-slate-300"
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
                  </button>
                </div>
              )}

              {message.text && (
                <div className={`mt-4 p-4 rounded-xl flex items-center text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2" /> : <ExclamationCircleIcon className="h-5 w-5 mr-2" />}
                  {message.text}
                </div>
              )}
            </div>

            {/* Stored Documents List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">Stored Documents</h2>
                <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-500">
                  {documents.length} Total
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-10 text-center animate-pulse text-slate-400">Loading your vault...</div>
                ) : documents.length === 0 ? (
                  <div className="p-16 text-center">
                    <DocumentIcon className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Your vault is empty</p>
                    <p className="text-slate-400 text-sm">Upload compliance documents to track them here.</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                          <DocumentIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{doc.name}</p>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">{doc.size || "Unknown Size"}</p>
                        </div>
                      </div>

                      <a
                        href={`${API_BASE}/${doc.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-4 py-2 rounded-lg transition-all"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
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