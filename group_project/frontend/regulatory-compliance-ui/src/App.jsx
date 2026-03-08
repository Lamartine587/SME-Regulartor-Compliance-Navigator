import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";








function App() {
  return (
    <Router>
      <Routes>
        
        
        <Route path="/" element={<Dashboard />} />
         <Route path="Permits" element={<Permits />} />
        <Route path="Documents" element={<DocumentVault />} />
        <Route path="Reminders" element={<Reminders />} />
      </Routes>
    </Router>
  );
}

export default App;