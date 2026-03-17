import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardSummary() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/dashboard/summary",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setSummary(data || {});
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardSummary();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard title="Total Permits">
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? "..." :summary.total}
                </p>
              </DashboardCard>

              <DashboardCard title="Valid Permits">
                <p className="text-3xl font-bold text-green-600">
                  {loading ? "..." :summary.valid}
                </p>
              </DashboardCard>

              <DashboardCard title="Expiring Soon">
                <p className="text-3xl font-bold text-orange-500">
                  {loading ? "..." :summary.expiring}
                </p>
              </DashboardCard>

              <DashboardCard title="Expired">
                <p className="text-3xl font-bold text-red-600">
                  {loading ? "..." :summary.expired}
                </p>
              </DashboardCard>
            </div>

            {/* Upcoming Expiries */}
            <DashboardCard title="Upcoming Expiries">
              <div className="space-y-3">

                {loading ? (<p className="text-gray-500">Loading permits...</p>) : summary.upcomingExpiries?.length>0?(  summary.upcomingExpiries?.map((permit) => (
                  <div
                    key={permit.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {permit.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {permit.authority}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {permit.expiryDate}
                      </p>

                      <p
                        className={`text-xs font-semibold ${
                          permit.daysLeft <= 30
                            ? "text-red-600"
                            : permit.daysLeft <= 60
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {permit.daysLeft} days left
                      </p>
                    </div>
                  </div>
                )))
                :(<p className="text-gray-500 ">No upcoming expiries</p>)}
              
              </div>

              <button
                onClick={() => navigate("/permits")}
                className="w-full mt-4 text-blue-600 font-medium py-2 text-sm"
              >
                View All Permits →
              </button>
            </DashboardCard>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;