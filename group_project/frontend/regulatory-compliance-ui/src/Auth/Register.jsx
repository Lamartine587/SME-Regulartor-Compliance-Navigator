import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordError, setShowPasswordError] =useState(false)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10,15}$/.test(phone);

  // Password rules
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

      const passwordValid =failedRules.length ===0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Enter a valid phone number (10-15 digits)");
      return;
    }

    
    
    if(!passwordValid){
      setError("Passsword must include:" + failedRules.join(", "));
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(email, phone, password);
      if (data.detail && Array.isArray(data.detail) && data.detail.length > 0) {
        setError(data.detail[0].msg);
      } else {
        navigate("/signin");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-500"
          >
            {showPassword ? (<EyeSlashIcon className="h-5 w-5"/>) :(<EyeIcon className ="h-5 w-5"/>)}
          </button>
        </div>

        <div className="relative" >
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onFocus={()=>setShowPasswordError(true)}
          disabled={!passwordValid} // <--- disable until password rules are met
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        />
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-500"
          >
            {showPassword ? (<EyeSlashIcon className="h-5 w-5"/>) :(<EyeIcon className ="h-5 w-5"/>)}
          </button>
       </div>

        {/* Show notification if field is disabled (rules not met) */}
{password &&!passwordValid && (
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
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">{error}</div>}
      </form>
    </div>
  );
}