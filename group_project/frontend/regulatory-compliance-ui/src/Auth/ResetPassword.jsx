import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = sessionStorage.getItem("resetEmail");

  const passwordRules = {
    "at least 8 characters": password.length >= 8,
    "uppercase letter": /[A-Z]/.test(password),
    "lowercase letter": /[a-z]/.test(password),
    "one number": /[0-9]/.test(password),
    "one special character": /[!@#$%^&*]/.test(password),
  };

  const failedRules = Object.entries(passwordRules)
    .filter(([_, valid]) => !valid)
    .map(([rule]) => rule);

  const passwordValid = failedRules.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) return setError("Password must include: " + failedRules.join(", "));
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const data = await resetPassword(email, "", password);
      if (data.detail && data.detail.length > 0) setError(data.detail[0].msg);
      else navigate("/signin");
    } catch {
      setError("Network error, please try again");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-500"
          >
            {showPassword ? (<EyeSlashIcon className="h-5 w-5"/>) :(<EyeIcon className="h-5 w-5"/>)}
          </button>
        </div>
      
      <div className="relative">
        <input
          type={showPassword ? "text" :"password"}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          /*disabled={!passwordValid}
          className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 ${
            !passwordValid ? "bg-gray-100 cursor-not-allowed" : ""
          }`}*/
        /> 
        <button 
        type="button"
        onClick={()=>setShowPassword(!showPassword)}
        className="absolute right-3 top-2 text-sm text-gray-500">
          {showPassword ? <EyeSlashIcon className="h-5 w-5" /> :<EyeIcon className="h-5 w-5"/>}
        </button>
       </div>


        {password && !passwordValid && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">
            Password must include: {failedRules.join(", ")}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">{error}</div>}
      </form>
    </div>
  );
}