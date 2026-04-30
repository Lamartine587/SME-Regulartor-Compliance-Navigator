import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsOfUse() {
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
        <h1 className="text-4xl font-black tracking-tight">Terms of Use</h1>
        <p className="text-sm text-slate-500">Last Updated: April 30, 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
          <p>By accessing or using the SME Regulatory Compliance Navigator, you agree to be bound by these Terms of Use and all applicable laws and regulations.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Description of Service</h2>
          <p>The SME Regulatory Compliance Navigator provides tools and resources to help small and medium enterprises manage their regulatory compliance obligations. This includes permit tracking, document management, and automated reminders.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. User Obligations</h2>
          <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to provide accurate and complete information during registration.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Intellectual Property</h2>
          <p>All content, features, and functionality on the platform are the exclusive property of the SME Regulatory Compliance Navigator and its licensors.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
          <p>We provide the service on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted or error-free. In no event shall we be liable for any damages arising out of the use or inability to use the service.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">6. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Your continued use of the service after such changes constitutes acceptance of the new terms.</p>
        </section>
      </div>
    </div>
  );
}
