import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+254\d{9}$/.test(phone);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (val && !val.startsWith("+")) val = "+" + val;
    const cleanVal = val.charAt(0) + val.slice(1).replace(/\D/g, "");
    if (cleanVal.length <= 13) {
      setPhone(cleanVal);
    }
  };

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

    if (!validateEmail(email)) return setError("Please enter a valid email address.");
    if (!validatePhone(phone)) return setError("Phone must be exactly +254 and 9 digits (e.g., +254711222333).");
    if (!passwordValid) return setError("Password must include: " + failedRules.join(", "));
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const data = await registerUser(email, phone, password);
      navigate("/verify-otp", { state: { email: email, userId: data.user_id } });
    } catch (err) {
      setError(err.message || "Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 dark:from-slate-950 to-indigo-900 dark:to-indigo-950 p-4 font-sans">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-5">
        
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">SME Regulatory Compliance Navigator</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Email Address</label>
            <input required type="email" placeholder="manager@sme.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">
              Phone Number <span className="text-indigo-600 dark:text-indigo-400 lowercase font-bold">(+254 format)</span>
            </label>
            <input 
              required 
              type="tel" 
              placeholder="+2547XXXXXXXX" 
              value={phone} 
              onChange={handlePhoneChange} 
              className="w-full border border-slate-200 dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-mono font-bold tracking-wider" 
            />
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 italic font-medium text-center">Required for SMS: +254 followed by 9 digits.</p>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Password</label>
            <input required type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white pr-10 text-sm" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-slate-400 dark:text-slate-500">
              {showPassword ? <EyeSlashIcon className="h-4 w-4"/> : <EyeIcon className ="h-4 w-4"/>}
            </button>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Confirm Password</label>
            <input required type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setShowPasswordError(true)} disabled={!passwordValid} className={`w-full border p-3 rounded-xl outline-none pr-10 text-sm ${!passwordValid ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 border-slate-200 dark:border-slate-600"}`} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={!passwordValid} className="absolute right-3 top-8 text-slate-400 dark:text-slate-500">
              {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4"/> : <EyeIcon className ="h-4 w-4"/>}
            </button>
          </div>
        </div>

        {password && !passwordValid && showPasswordError && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-300 p-3 rounded-xl text-[10px] font-medium">
            <span className="font-black uppercase tracking-tighter block mb-1">Security Standards:</span>
            <ul className="list-disc pl-4 space-y-0.5">{failedRules.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        )}

        {error && <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 p-3 rounded-xl text-center text-[10px] font-black uppercase tracking-tight border border-rose-100 dark:border-rose-700">{error}</div>}

        <button type="submit" disabled={loading} className={`w-full p-4 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-md ${loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
          {loading ? "Creating Profile..." : "Create Account"}
        </button>

        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">Sign In</button>
        </p>

      </form>
    </div>
  );
}