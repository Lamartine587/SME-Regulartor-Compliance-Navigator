import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";

function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: "/", label: "Dashboard" },
    { path: "/permits", label: "Permits" },
    { path: "/documents", label: "Document Vault" },
    { path: "/reminders", label: "Reminders" },
  ];

  const isActive = (path) => location.pathname === path;

  const navigate= useNavigate();
  const handleLogout=()=>{
    removeToken();
    navigate("/SignIn");
  }


  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col  h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              
            </div>
            <h1 className="text-xl font-bold text-gray-900">Menu</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 text-left rounded-lg hover:bg-gray-50">
              Settings
            </button>
            <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 text-left rounded-lg hover:bg-red-50 mt-1">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
}

export default Sidebar;