import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Reminders() {

  // State to store reminders coming from backend
  const [reminders, setReminders] = useState([]);

  // State to store any fetch error
  const [error, setError] = useState("");

  useEffect(() => {

    // Function to fetch system-generated reminders
    const fetchReminders = async () => {
      try {
        // Send GET request to backend
        const response = await fetch("YOUR_BACKEND_REMINDERS_URL");

        // If response is not OK (e.g. 404, 500), throw error
        if (!response.ok) {
          throw new Error("Failed to fetch reminders");
        }

        // Convert response to JSON
        const data = await response.json();

        // Save reminders into state
        setReminders(data);

      } catch {
        // If fetch fails (backend not running, wrong URL, etc.)
        setError("Unable to load reminders.");
      }
    };

    // ===============================
    // Backend connection
    // Uncomment when backend is ready
    // ===============================

    // fetchReminders();

  }, []); // Empty dependency array → runs once when page loads


  // Function to style reminder status badge
  const getStatusStyle = (status) => {

    if (status === "Overdue") {
      return "bg-red-100 text-red-600";
    }

    if (status === "Upcoming") {
      return "bg-yellow-100 text-yellow-700";
    }

    // Default style (e.g. Completed)
    return "bg-green-100 text-green-600";
  };


  return (
    <div className="flex h-screen bg-gray-50">

      {/* Reusable Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* Reusable Navbar */}
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">

          <div className="max-w-6xl mx-auto">

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reminders
              </h1>
              <p className="text-gray-600">
                Automatically generated compliance alerts
              </p>
            </div>

            {/* Display error if fetch fails */}
            {error && (
              <p className="text-red-600 mb-4">{error}</p>
            )}

            {/* Reminders List Container */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">

              {/* If reminders exist, display them */}
              {reminders.length > 0 ? (

                <div className="space-y-4">

                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {reminder.title}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Due: {reminder.dueDate}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                          reminder.status
                        )}`}
                      >
                        {reminder.status}
                      </span>

                    </div>
                  ))}

                </div>

              ) : (

                // If no reminders found
                <p className="text-gray-500 text-center py-6">
                  No active reminders.
                </p>

              )}

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Reminders;