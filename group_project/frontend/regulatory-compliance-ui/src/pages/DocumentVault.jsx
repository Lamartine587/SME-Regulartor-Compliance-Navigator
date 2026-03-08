import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DocumentVault() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch documents from backend
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch("http://localhost:5000/api/vault/documents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    }

    fetchDocuments();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles([...selectedFiles, ...Array.from(e.dataTransfer.files)]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    }
  };

  // Upload files to backend
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:5000/api/vault/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setMessage("Files uploaded successfully!");
      setSelectedFiles([]);

      // Refresh documents list
      const updated = await fetch("http://localhost:5000/api/vault/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await updated.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to upload files.");
    }
  };

  const getFileIcon = () => (
    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    </svg>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Document Vault
            </h1>

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
              }`}
            >
              <p className="mb-4">Drag & drop files here</p>

              <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg">
                Browse Files
                <input type="file" className="hidden" multiple onChange={handleFileChange} />
              </label>
            </div>

            <button
              onClick={handleUpload}
              className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Upload Selected Files
            </button>

            {message && <p className="text-green-600 mb-4">{message}</p>}

            {/* Selected Files */}
            {selectedFiles.map((file, index) => (
              <div key={index} className="p-3 border mb-2 rounded">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ))}

            {/* Documents from backend */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Stored Documents</h2>

              {documents.length === 0 ? (
                <p>No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between p-4 border-b"
                  >
                    <div className="flex items-center gap-4">
                      {getFileIcon()}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.size}</p>
                      </div>
                    </div>

                    <a
                      href={`http://localhost:5000/api/vault/documents/${doc.id}`}
                      className="text-blue-600 text-sm"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default DocumentVault;