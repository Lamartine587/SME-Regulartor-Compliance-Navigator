import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  BellAlertIcon, 
  ArrowPathIcon,
  CheckBadgeIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

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
            <Link to="../Auth/SignIn" className="text-slate-600 font-bold hover:text-indigo-600 transition-colors mr-4">
              Sign In
            </Link>
            <Link to="/Register" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-300">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
            Simplify Your Business <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Compliance.
            </span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-12">
            The all-in-one platform for Kenyan SMEs to track Single Business Permits, securely store KRA documents, and never miss a renewal deadline.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/Register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-lg">
              Start Free Trial
            </Link>
            <Link to="../Auth/SignIn" className="w-full sm:w-auto px-8 py-4 bg-slate-200/70 text-slate-700 font-bold rounded-2xl border border-slate-300 hover:bg-slate-200 transition-all text-lg shadow-sm">
              See How It Works
            </Link>
          </div>
        </div>
      </main>

      {/* Core Features Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Everything you need to stay compliant</h2>
            <p className="text-slate-500 text-lg">Stop worrying about county askaris and focus on growing your business.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100/50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <DocumentTextIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Permit Tracking</h3>
              <p className="text-slate-500">Monitor the real-time status of your Single Business Permits, fire clearances, and health certificates in one centralized dashboard.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Document Vault</h3>
              <p className="text-slate-500">Securely store your KRA PINs, certificates of incorporation, and compliance paperwork digitally. Access them instantly from your phone.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-100/50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <BellAlertIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Reminders</h3>
              <p className="text-slate-500">Receive automated SMS and email alerts 30, 15, and 7 days before your licenses expire so you never pay late penalties again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Compliance made easy in three steps</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Create your profile</h4>
                    <p className="text-slate-500 mt-1">Register your business details and select your county of operation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Upload your current documents</h4>
                    <p className="text-slate-500 mt-1">Snap a photo or upload PDFs of your existing permits and licenses.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Let SMENav do the tracking</h4>
                    <p className="text-slate-500 mt-1">We extract the expiry dates and set up automated reminder schedules for you.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded-3xl p-8 aspect-square flex items-center justify-center border border-slate-200 shadow-inner">
              {/* Placeholder for an app screenshot or illustration */}
              <div className="text-center">
                <ChartBarIcon className="h-24 w-24 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">App Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-black text-white tracking-tight">
                SME<span className="text-indigo-400">Nav</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Empowering Kenyan small and medium enterprises to manage compliance effortlessly.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-slate-500 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} SMENav. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for Kenyan SMEs.</p>
        </div>
      </footer>

    </div>
  );
}