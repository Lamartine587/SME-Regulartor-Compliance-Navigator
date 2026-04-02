import React, { useState, useEffect } from "react";
import { verifyOTP, requestPhoneOTP } from "../services/authService";
import { getProfile, updateProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar"; // Imported and now integrated below

const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", 
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", 
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", 
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", 
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", 
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", 
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

export default function Profile() {
  const [smsOtp, setSmsOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const userId = localStorage.getItem("user_id"); 

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    is_phone_verified: false,
    role_title: "",
    business_name: "",
    registration_number: "",
    industry: "",
    county_location: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          is_phone_verified: data.is_phone_verified || false,
          role_title: data.role_title || "",
          business_name: data.business_name || "",
          registration_number: data.registration_number || "",
          industry: data.industry || "",
          county_location: data.county_location || ""
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleRequestNewOTP = async () => {
    setIsRequesting(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      await requestPhoneOTP();
      setOtpSuccess("A new code has been sent to your phone!");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setOtpError(""); setOtpSuccess("");
    if (!smsOtp) return setOtpError("Please enter the 6-digit code.");
    
    setIsVerifying(true);
    try {
      await verifyOTP({ user_id: parseInt(userId), verification_type: "sms", otp_code: smsOtp });
      setOtpSuccess("Phone number successfully verified!");
      setProfileData({ ...profileData, is_phone_verified: true });
      setSmsOtp(""); 
    } catch (err) {
      setOtpError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });
    try {
      const updated = await updateProfile(profileData);
      setProfileData(updated);
      setSaveMessage({ type: "success", text: "Profile & Phone updated!" });
      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-600">
        Syncing Profile Data...
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      {/* 1. Sidebar is placed here on the left */}
      <Sidebar />

      {/* 2. Main content area on the right */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        {/* 3. The scrollable form container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Configure your professional identity and business details.</p>
            </div>

            {/* PROFILE FORM SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Professional Identity</h3>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
                      <input type="text" name="first_name" value={profileData.first_name} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
                      <input type="text" name="last_name" value={profileData.last_name} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                      <div className="relative">
                        <input type="text" name="phone" value={profileData.phone} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                        <span className={`absolute right-3 top-2.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${profileData.is_phone_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {profileData.is_phone_verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role / Job Title</label>
                      <input type="text" name="role_title" value={profileData.role_title} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" placeholder="e.g. Director" />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Name</label>
                      <input type="text" name="business_name" value={profileData.business_name} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registration No. / PIN</label>
                      <input type="text" name="registration_number" value={profileData.registration_number} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Industry Type</label>
                      <select name="industry" value={profileData.industry} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium">
                        <option value="">Select Industry...</option>
                        <option value="Retail / Small Shop">Retail / Small Shop</option>
                        <option value="Agribusiness & Farming">Agribusiness & Farming</option>
                        <option value="Fast Food & Catering">Fast Food & Catering</option>
                        <option value="Beauty, Salon & Spa">Beauty, Salon & Spa</option>
                        <option value="Construction & Hardware">Construction & Hardware</option>
                        <option value="ICT & Cyber Cafe">ICT & Cyber Cafe</option>
                        <option value="Transport & Logistics">Transport & Logistics</option>
                        <option value="Healthcare & Pharmacy">Healthcare & Pharmacy</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">County Location</label>
                      <select name="county_location" value={profileData.county_location} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium">
                        <option value="">Select County...</option>
                        {KENYAN_COUNTIES.map(county => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="h-5">
                    {saveMessage.text && (
                      <span className={`text-xs font-black uppercase tracking-tighter ${saveMessage.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {saveMessage.text}
                      </span>
                    )}
                  </div>
                  <button type="submit" disabled={isSaving} className={`px-8 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}>
                    {isSaving ? "Syncing..." : "Update Details"}
                  </button>
                </div>
              </form>
            </div>

            {/* VERIFICATION DRAWER */}
            {!profileData.is_phone_verified && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="px-6 py-5 border-b border-slate-200 bg-amber-50/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-amber-900">Security Verification</h3>
                  <button 
                    type="button"
                    onClick={handleRequestNewOTP}
                    disabled={isRequesting}
                    className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900 bg-white border border-amber-200 px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isRequesting ? "Sending..." : "Request New Code"}
                  </button>
                </div>
                <div className="p-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Verify {profileData.phone}</h4>
                    <p className="text-xs text-amber-700 mt-1 mb-4 font-medium">Enter the SMS code to enable automated compliance alerts.</p>
                    <form onSubmit={handleVerifyPhone} className="sm:flex sm:items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="000000" 
                        maxLength="6" 
                        value={smsOtp} 
                        onChange={(e) => setSmsOtp(e.target.value.replace(/\D/g, ''))} 
                        className="w-full sm:max-w-[180px] border border-amber-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none tracking-[0.5em] font-mono text-center bg-white text-sm" 
                      />
                      <button 
                        type="submit" 
                        disabled={!smsOtp || isVerifying} 
                        className="mt-3 w-full sm:mt-0 sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-amber-600 text-white hover:bg-amber-700 transition-all disabled:bg-amber-300"
                      >
                        {isVerifying ? "Verifying..." : "Confirm Code"}
                      </button>
                    </form>
                    {otpError && <div className="mt-3 text-rose-600 text-[10px] font-black uppercase tracking-tighter">{otpError}</div>}
                    {otpSuccess && <div className="mt-3 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">{otpSuccess}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}