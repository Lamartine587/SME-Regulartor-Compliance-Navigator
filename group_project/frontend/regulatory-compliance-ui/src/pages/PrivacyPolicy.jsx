import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline mb-4"
        >
          &larr; Back
        </button>
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: April 30, 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, including your email address, phone number, and any documents you upload to the Document Vault.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. How We Use Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to send you automated reminders about compliance deadlines, and to communicate with you about your account.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Information Sharing</h2>
          <p>We do not share your personal information with third parties except as required by law or as necessary to provide our services (e.g., SMS alerts via service providers).</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Data Security</h2>
          <p>We implement reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet transmission is ever fully secure.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You can manage your account settings through the Profile and Settings pages.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@sme-compliance.co.ke.</p>
        </section>
      </div>
    </div>
  );
}
