import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  // If no token, send to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in but NOT an admin, send to dashboard
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // If they are an admin, render the requested admin page
  return <Outlet />;
}