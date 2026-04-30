import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  BellAlertIcon, 
  ArrowPathIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="fixed w-full bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              SME<span className="text-indigo-600 dark:text-indigo-400">Nav</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6 text-amber-400 hover:text-amber-500" />
              ) : (
                <MoonIcon className="h-6 w-6 text-indigo-600 hover:text-indigo-700" />
              )}
            </button>

            {/* Standardized absolute paths */}
            <Link to="/login" className="hidden md:block text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mx-4">
              Sign In
            </Link>
            <Link to="/register" className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-slate-300 dark:shadow-indigo-900/50">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
            Simplify Your Business <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">
              Compliance.
            </span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mb-12">
            The all-in-one platform for Kenyan SMEs to track Single Business Permits, securely store KRA documents, and monitor financial transactions with AI-driven precision.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 text-lg">
              Create Free Account
            </Link>

            <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-lg shadow-sm">
              Member Login
            </Link>
          </div>
        </div>
      </main>

      {/* Core Features Section */}
      <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Built for Kenyan SMEs</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Stop worrying about manual tracking and focus on your business growth.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 dark:shadow-none">
                <DocumentTextIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Permit Tracking</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated monitoring for Single Business Permits, Fire Clearances, and Health Certificates across all Kenyan counties.
              </p>
            </div>

            <div className="group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 dark:shadow-none">
                <ArrowPathIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Financial Ledger</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                AI-powered extraction of line items from invoices. Capture total liabilities and itemized costs automatically.
              </p>
            </div>

            <div className="group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all">
              <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-200 dark:shadow-none">
                <BellAlertIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Reminders</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive mandatory SMS and Email notifications before expiration deadlines to avoid heavy penalties and late fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-indigo-600 p-1.5 rounded-md">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                SME<span className="text-indigo-600">Nav</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Empowering technology entrepreneurs and local SMEs with automated regulatory compliance and secure document synchronization.
            </p>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-4">Ecosystem</h4>
            <ul className="space-y-3 text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Business Vault</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Personal IDs</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">KRA Sync</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-4">Support</h4>
            <ul className="space-y-3 text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200 dark:border-slate-800 text-slate-400 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Anga Systems. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 md:mt-0">
            <CheckBadgeIcon className="h-4 w-4 text-indigo-500" />
            <span>Built for Kenyan Business Excellence.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}