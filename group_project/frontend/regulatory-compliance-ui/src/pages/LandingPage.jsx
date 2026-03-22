import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, DocumentTextIcon, BellAlertIcon } from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation Bar */}
      <nav className="fixed w-full bg-slate-100/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              SME<span className="text-indigo-600">Nav</span>
            </span>
          </div>
          
          <div className="space-x-4">
            <Link to="/SignIn" className="text-slate-600 font-bold hover:text-indigo-600 transition-colors mr-4">
              Sign In
            </Link>
            {/* Nav Get Started Button */}
            <Link to="/Register" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-300">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-48 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
            Simplify Your Business <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Compliance.
            </span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-12">
            The all-in-one platform for Kenyan SMEs to track permits, securely store documents, and never miss a renewal deadline.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Hero Get Started Button */}
            <Link to="/Register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-lg">
              Get Started
            </Link>
            <Link to="/SignIn" className="w-full sm:w-auto px-8 py-4 bg-slate-200/70 text-slate-700 font-bold rounded-2xl border border-slate-300 hover:bg-slate-200 transition-all text-lg shadow-sm">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100/50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Permit Tracking</h3>
              <p className="text-slate-500">Monitor the status of your Single Business Permits, fire clearances, and health certificates in one view.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Document Vault</h3>
              <p className="text-slate-500">Securely store and organize all your critical compliance paperwork digitally, accessible anytime.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100/50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BellAlertIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Reminders</h3>
              <p className="text-slate-500">Receive automated alerts before your licenses expire so you never pay late penalties again.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}