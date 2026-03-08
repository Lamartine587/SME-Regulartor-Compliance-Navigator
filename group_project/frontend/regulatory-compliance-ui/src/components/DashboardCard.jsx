import React from "react";

function DashboardCard({ title, children, className = "" }) {
  return (
    <div
      className={`
        bg-white
        rounded-xl
        border border-gray-200
        shadow-sm
        p-6
        hover:shadow-md
        transition duration-200
        ${className}
      `}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h3>
      )}

      <div>
        {children}
      </div>
    </div>
  );
}

export default DashboardCard;