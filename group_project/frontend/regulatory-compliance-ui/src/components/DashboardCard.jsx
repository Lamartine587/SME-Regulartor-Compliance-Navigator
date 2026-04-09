import React from "react";

export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 ${className}`}
    >
      {/* Card Title */}
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        {title}
      </h3>
      
      {/* Card Content (This injects the numbers and icons from Dashboard.jsx) */}
      <div>
        {children}
      </div>
    </div>
  );
}