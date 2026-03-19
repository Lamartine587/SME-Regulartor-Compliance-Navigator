import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/authService";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve the email saved during the Forgot Password step
  const email = sessionStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP code.");
      return;
    }

    setLoading(true);

    try {
      // Passing 0 as a placeholder for user_id based on your backend spec
      const data = await verifyOTP(0, otp, "password_reset"); 

      if (data?.detail && Array.isArray(data.detail) && data.detail.length > 0) {
        setError(data.detail[0].msg || "Verification failed. Please try again.");
      } else {
        // Success: Move to the final reset password screen
        navigate("/reset-password");
      }
    } catch (err) {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify OTP</h2>
          <p className="text-sm text-gray-500">
            {email ? (
              <>We sent a verification code to <span className="font-semibold text-gray-800">{email}</span></>
            ) : (
              "Enter the verification code sent to your email."
            )}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
              Security Code
            </label>
            <input
              type="text"
              placeholder="000000"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Optional: ensures only numbers are typed
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none bg-gray-50 text-center tracking-[0.5em] text-xl font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!otp || loading}
          className={`w-full p-3 rounded-lg text-white font-semibold tracking-wide transition-all ${
            !otp || loading 
              ? "bg-indigo-300 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            &larr; Back to Forgot Password
          </button>
        </div>

      </form>
    </div>
  );
}