import React, { useState, useEffect } from "react";
import { verifyOTP, requestPhoneOTP } from "../services/authService";
import { getProfile, updateProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", 
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", 
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", 
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", 
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", 
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", 
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

const BUSINESS_TYPES = [
  "General Retail (Duka / Boutique / Shop)",
  "Agribusiness & Produce Value Addition",
  "ICT, Cyber Cafes & Digital Services",
  "Small Scale Manufacturing (Jua Kali / Tailoring)",
  "Fast Food, Restaurants & Outside Catering",
  "Beauty, Salon & Barbershop Services",
  "Logistics, Delivery & Boda Boda Services",
  "Pharmacy & Private Health Clinics",
  "Professional Services (Consulting / Law / Accounting)",
  "Hardware, Construction & Real Estate",
  "Private Schools & Daycare Centers",
  "Artisan & Maintenance (Plumbing / Electrical / Auto)",
  "Other / Diversified SME"
];

// Added Job Titles for SME context
const JOB_TITLES = [
  "Owner / Director",
  "Manager / Supervisor",
  "Money Manager / Accounts",
  "Office Assistant / Admin",
  "IT / Tech Support Person",
  "Sales / Marketing Person",
  "Other"
];

export default function Profile() {
  const [smsOtp, setSmsOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const userId = localStorage.getItem("user_id"); 

  const [profileData, setProfileData] = useState({
    email: "", 
    first_name: "", last_name: "", phone: "", is_phone_verified: false,
    role_title: "", business_name: "", registration_number: "", industry: "", county_location: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData({ ...data });
      } catch (error) {
        console.error("Profile load error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    setProfileData({ ...profileData, [name]: sanitizedValue });
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (val && !val.startsWith("+")) val = "+" + val;
    const cleanVal = val.charAt(0) + val.slice(1).replace(/\D/g, "");
    if (cleanVal.length <= 13) {
      setProfileData({ ...profileData, phone: cleanVal });
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleRequestNewOTP = async () => {
    setIsRequesting(true); setOtpError(""); setOtpSuccess("");
    try {
      await requestPhoneOTP();
      setOtpSuccess("A new code has been sent!");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setOtpError(""); setOtpSuccess("");
    if (!smsOtp) return setOtpError("Enter the code.");
    setIsVerifying(true);
    try {
      await verifyOTP({ user_id: parseInt(userId), verification_type: "sms", otp_code: smsOtp });
      setOtpSuccess("Verified!");
      setProfileData({ ...profileData, is_phone_verified: true });
      setSmsOtp(""); 
    } catch (err) {
      setOtpError(err.message || "Invalid code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.first_name || !profileData.last_name || !profileData.phone || !profileData.role_title) {
      return setSaveMessage({ type: "error", text: "Please fill all required fields." });
    }

    setIsSaving(true); setSaveMessage({ type: "", text: "" });
    try {
      const updated = await updateProfile(profileData);
      setProfileData(updated);
      setSaveMessage({ type: "success", text: "Settings Updated!" });
      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "Update Failed." });
      console.error('error' , error.message);
      
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 uppercase text-xs tracking-widest">Syncing Data...</div>;

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your professional and business identity.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <form onSubmit={handleProfileUpdate} className="p-8 space-y-8">
                
                {/* PERSONAL DETAILS SECTION */}
                <div>
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Registered Email (Not Editable)</label>
                      <input 
                        type="email" 
                        value={profileData.email} 
                        readOnly 
                        className="w-full border border-slate-200 p-3 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">First Name</label>
                      <input 
                        type="text" 
                        name="first_name" 
                        placeholder="e.g. John"
                        value={profileData.first_name} 
                        onChange={handleNameChange} 
                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Last Name</label>
                      <input 
                        type="text" 
                        name="last_name" 
                        placeholder="e.g. Doe"
                        value={profileData.last_name} 
                        onChange={handleNameChange} 
                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Phone Number <span className="text-indigo-600 lowercase font-bold">(+254 format)</span></label>
                      <div className="relative">
                        <input type="tel" name="phone" value={profileData.phone} onChange={handlePhoneChange} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-mono font-bold tracking-wider" />
                        <span className={`absolute right-3 top-2.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${profileData.is_phone_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {profileData.is_phone_verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>

                    {/* Updated Job Title Dropdown */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Job Title</label>
                      <select 
                        name="role_title" 
                        value={profileData.role_title} 
                        onChange={handleChange} 
                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium cursor-pointer"
                      >
                        <option value="">Select Job Title...</option>
                        {JOB_TITLES.map(title => <option key={title} value={title}>{title}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* BUSINESS INFORMATION SECTION */}
                <div>
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Business Name</label>
                      <input type="text" name="business_name" value={profileData.business_name} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">KRA PIN / Reg No.</label>
                      <input type="text" name="registration_number" value={profileData.registration_number} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Type of Business (Industry)</label>
                      <select name="industry" value={profileData.industry} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium cursor-pointer">
                        <option value="">Select Category...</option>
                        {BUSINESS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">County of Operation</label>
                      <select name="county_location" value={profileData.county_location} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium cursor-pointer">
                        <option value="">Select County...</option>
                        {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="h-5">
                    {saveMessage.text && <span className={`text-[10px] font-black uppercase ${saveMessage.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{saveMessage.text}</span>}
                  </div>
                  <button type="submit" disabled={isSaving} className={`px-10 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${isSaving ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
                    {isSaving ? "Syncing..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>

            {/* VERIFICATION SECTION */}
            {!profileData.is_phone_verified && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest">Phone Verification Required</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Verify your phone to enable automated KRA/County SMS alerts.</p>
                  </div>
                  <button onClick={handleRequestNewOTP} disabled={isRequesting} className="px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-lg text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all">
                    {isRequesting ? "Sending..." : "Request OTP"}
                  </button>
                </div>

                <form onSubmit={handleVerifyPhone} className="flex gap-3 max-w-sm">
                  <input type="text" placeholder="000000" maxLength="6" value={smsOtp} onChange={(e) => setSmsOtp(e.target.value.replace(/\D/g, ''))} className="flex-1 border border-amber-300 p-3 rounded-xl outline-none text-center font-mono font-bold tracking-[0.5em] text-sm bg-white dark:bg-slate-800" />
                  <button type="submit" disabled={!smsOtp || isVerifying} className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 shadow-lg shadow-amber-100">
                    {isVerifying ? "..." : "Verify Number"}
                  </button>
                </form>
                {(otpError || otpSuccess) && <p className={`text-[10px] font-black uppercase ${otpError ? 'text-rose-600' : 'text-emerald-600'}`}>{otpError || otpSuccess}</p>}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}