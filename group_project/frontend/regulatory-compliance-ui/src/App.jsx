import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";

// Auth Components
import Register from "./Auth/Register";
import VerifyOTP from "./Auth/VerifyOTP";
import SignIn from "./Auth/SignIn";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";

// Route Protectors
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* PUBLIC AUTH ROUTES (Bypassed if already logged in) */}
        <Route path="/Register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/SignIn" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/ForgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/VerifyOTP" element={<PublicRoute><VerifyOTP/></PublicRoute>} />
        <Route path="/ResetPassword" element={<PublicRoute><ResetPassword /></PublicRoute>} />
       
        {/* PROTECTED ROUTES (Require Login) */}
        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/Permits" element={<ProtectedRoute><Permits /></ProtectedRoute>} />
        <Route path="/DocumentVault" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/Reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />

        {/* DEFAULT REDIRECT (Catches 404s and sends them home) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;