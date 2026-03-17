import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";
import Register from "./Auth/Register";
import VerifyOTP from "./Auth/VerifyOTP";
import SignIn from "./Auth/SignIn";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";








function App() {
  return (
    <Router>
      <Routes>
        <Route path="Register" element={<Register />} />
        <Route path="SignIn" element={<SignIn />} />
        <Route path="ForgotPassword" element={<ForgotPassword />} />
        <Route path="VerifyOTP" element={<VerifyOTP/>} />
        <Route path="ResetPassword" element={<ResetPassword />} />
         <Route path="/" element={<Dashboard />} />
         <Route path="Permits" element={<Permits />} />
        <Route path="Documents" element={<DocumentVault />} />
        <Route path="Reminders" element={<Reminders />} />
        
        
        
      </Routes>
    </Router>
  );
}

export default App;