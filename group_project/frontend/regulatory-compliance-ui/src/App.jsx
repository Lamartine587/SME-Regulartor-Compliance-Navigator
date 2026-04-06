import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import AdminRoute from "./components/AdminRoute";
import AdminErrors from "./pages/AdminErrors";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile"; 

import Register from "./Auth/Register";
import VerifyOTP from "./Auth/VerifyOTP";
import SignIn from "./Auth/SignIn";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} /> 
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP/></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
       
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/permits" element={<ProtectedRoute><Permits /></ProtectedRoute>} />
        <Route path="/document-vault" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
        
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/errors" element={<AdminErrors />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;