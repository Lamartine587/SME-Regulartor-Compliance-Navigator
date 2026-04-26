import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "../services/authService";
import api from "../utils/api"; // Make sure to import your API client

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || "";
  const userId = location.state?.userId;
  const purpose = location.state?.purpose; 

  const [emailOtp, setEmailOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/Auth/SignIn");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOtp || emailOtp.length !== 6) {
      return setError("Please enter the full 6-digit verification code.");
    }

    setLoading(true);

    // --- PASSWORD RESET STRICT VERIFICATION ---
    if (purpose === "password_reset") {
      try {
        // Actually verify the code with the backend BEFORE moving on
        await api.post("/auth/verify-reset-otp", {
          email: email,
          otp_code: emailOtp
        });

        setSuccess("Code verified! Redirecting...");
        setTimeout(() => {
          navigate("/reset-password", { 
            state: { email: email, otpCode: emailOtp } 
          });
        }, 1000);
      } catch (err) {
        setError(err.response?.data?.detail || "Invalid code. Please try again.");
      } finally {
        setLoading(false);
      }
      return; 
    }

    // --- STANDARD REGISTRATION LOGIC ---
    if (!userId) {
      setLoading(false);
      return setError("Session expired. Please return to the registration page.");
    }

    try {
      await verifyOTP({
        user_id: parseInt(userId),
        verification_type: "email",
        otp_code: emailOtp
      });

      setSuccess("Email verified! Redirecting to login...");
      setTimeout(() => navigate("/Auth/SignIn"), 2000);

    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; 

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 dark:from-slate-950 to-indigo-900 dark:to-indigo-950 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Verify Email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {email ? <>Code sent to <span className="font-semibold text-gray-800">{email}</span></> : "Enter the code sent to your email."}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input 
              required 
              type="text" 
              placeholder="000000" 
              maxLength="6" 
              value={emailOtp} 
              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-center tracking-[0.5em] text-xl font-mono" 
            />
          </div>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 p-3 rounded-lg text-center text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 p-3 rounded-lg text-center text-sm font-medium">{success}</div>}

        <button 
          type="submit" 
          disabled={!emailOtp || loading} 
          className="w-full p-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>
    </div>
  );
}