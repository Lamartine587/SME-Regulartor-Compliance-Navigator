import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Permits() {
  const [permits, setPermits] = useState([]);

  const getDaysRemaining = (expiryDate) => {
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

  // ==============================
  // Backend fetch (commented)
  // ==============================
  /*
  useEffect(() => {
    const fetchPermits = async () => {
      try {
        const res = await fetch("YOUR_BACKEND_PERMITS_URL");
        const data = await res.json();
        setPermits(data);
      } catch (err) {
        console.log("Backend not ready yet");
      }
    };
    fetchPermits();
  }, []);
  */
  // ==============================

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">

        {/* Navbar reused here */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">

          <h1 className="text-2xl text-center font-bold mb-6">
            Permits
          </h1>

          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Authority</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {permits.length > 0 ? (
                  permits.map((permit) => {
                    const daysLeft = getDaysRemaining(permit.expiryDate);
                    const status = getStatus(daysLeft);

                    return (
                      <tr key={permit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {permit.name}
                        </td>
                        <td className="px-6 py-4">
                          {permit.authority}
                        </td>
                        <td className="px-6 py-4">
                          {permit.issueDate}
                        </td>
                        <td className="px-6 py-4">
                          {permit.expiryDate}
                        </td>
                        <td
                          className={`px-6 py-4 font-semibold ${
                            status === "Valid"
                              ? "text-green-600"
                              : status === "Expiring Soon"
                              ? "text-orange-500"
                              : "text-red-600"
                          }`}
                        >
                          {status}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500"
                    >
                      No permits available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p></p>

        </main>
      </div>
    </div>
  );
}

export default Permits;