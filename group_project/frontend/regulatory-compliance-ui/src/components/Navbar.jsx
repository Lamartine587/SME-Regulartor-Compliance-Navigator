import React, { useState } from "react";
import { removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  const navigate =useNavigate();
  const handleLogout =()=>{
    removeToken();
    navigate("/SignIn");
  }

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 lg:h-12 md:h-20 flex justify-between items-center">
      
      <p className="pl-11 lg:text-xl md:text-md font-semibold text-slate-800">
        Monitor and manage your business permits
      </p>

      <div className="relative">
        
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          {/* Profile Circle */}
          <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            ?
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
              View Profile
            </button>

            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
              Update Profile
            </button>

            <button 
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
              Logout
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;