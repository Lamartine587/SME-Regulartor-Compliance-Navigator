import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/authService";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Enter OTP code");
      return;
    }

    setLoading(true);

    try {
      const data = await verifyOTP(0, otp, "password_reset"); // user_id=0 placeholder

      if (data.detail && Array.isArray(data.detail) && data.detail.length > 0) {
        setError(data.detail[0].msg);
      } else {
        // Success
        navigate("/reset-password");
      }
    } catch (err) {
      setError("Network error, please try again");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={!otp || loading}
          className={`w-full p-2 rounded text-white ${
            !otp || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">{error}</div>}
      </form>
    </div>
  );
}