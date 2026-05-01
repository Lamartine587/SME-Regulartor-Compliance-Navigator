// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// DEBUG: Check what Vite actually sees
console.log("Vite Env Check:", import.meta.env);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("❌ CRITICAL: VITE_GOOGLE_CLIENT_ID is undefined. Google Auth will fail.");
} else {
  console.log("✅ Google Client ID Loaded Successfully.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Use a fallback empty string to prevent the library from crashing on 'undefined' */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)