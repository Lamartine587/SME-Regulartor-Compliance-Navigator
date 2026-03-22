import React from "react";

export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div 
      className={`bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 ${className}`}
    >
      {/* Card Title */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      
      {/* Card Content (This injects the numbers and icons from Dashboard.jsx) */}
      <div>
        {children}
      </div>
    </div>
  );
}