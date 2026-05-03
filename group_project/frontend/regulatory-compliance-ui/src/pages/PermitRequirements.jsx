import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  InformationCircleIcon, 
  ExclamationTriangleIcon, 
  BuildingLibraryIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';

// Data simplified for diverse literacy levels
const SIMPLE_REQS = {
  "Running a Shop (Duka, Boutique, Stall)": [
    { paper: "Single Business Permit", who: "County Government", why: "The main 'Kibali' to open your doors to customers." },
    { paper: "Fire Safety Paper", who: "Fire Department", why: "Shows your shop is safe from fire accidents." },
    { paper: "KRA PIN", who: "KRA", why: "Your business identity number for tax." }
  ],
  "Farming & Selling Food (Produce)": [
    { paper: "Business Permit", who: "County Government", why: "The basic license to sell your harvest." },
    { paper: "Weights & Measures Stamp", who: "Trade Office", why: "Shows your weighing scales are fair and honest." },
    { paper: "KEBS Quality Mark", who: "KEBS", why: "Required if you pack food (like honey or flour) in jars or bags." }
  ],
  "Cyber Cafe & Computer Services": [
    { paper: "Business Permit", who: "County Government", why: "Basic license to run your office." },
    { paper: "Music/Media License (MCSK)", who: "Copyright Board", why: "Required if you play radio or music for customers." },
    { paper: "Data Protection Paper", who: "Data Office", why: "Shows you keep customer secrets (like ID copies) safe." }
  ],
  "Hotel, Fast Food & Catering": [
    { paper: "Food Handler's Certificate", who: "Public Health", why: "A 'Kadi ya Afya' showing you and your staff are healthy to touch food." },
    { paper: "Health Inspection Paper", who: "County Health", why: "Shows your kitchen is clean and safe for the public." },
    { paper: "Liquor License", who: "County Govt", why: "Only if you plan to sell alcohol." }
  ],
  "Boda Boda & Delivery Services": [
    { paper: "NTSA Operating License", who: "NTSA", why: "Special permission for commercial transport." },
    { paper: "Commercial Insurance", who: "Insurance Company", why: "Insurance that covers you while working, not just personal use." }
  ],
  "Pharmacy & Chemist Shop": [
    { paper: "Pharmacy Board License (PPB)", who: "Poisons Board", why: "The main permit for anyone selling medicine." },
    { paper: "Waste Disposal Permit", who: "NEMA / Health Office", why: "Shows you have a safe way to throw away used needles or expired drugs." }
  ],
  "Hardware & Construction": [
    { paper: "NCA Certificate", who: "National Construction Authority", why: "Mandatory if you are doing actual building or repair work." },
    { paper: "Weights & Measures", who: "Trade Office", why: "To verify your scales for selling cement, nails, or sand." }
  ],
  "Tailoring & Small Making (Jua Kali)": [
    { paper: "Business Permit", who: "County Government", why: "Basic permit for your workshop or stall." },
    { paper: "KEBS Mark", who: "KEBS", why: "Optional, but helps you sell your clothes or items in big supermarkets." }
  ]
};

export default function PermitRequirements() {
  const [selectedBusiness, setSelectedBusiness] = useState("Running a Shop (Duka, Boutique, Stall)");

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Integrated Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Integrated Navbar */}
        <Navbar />

        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Simple Header */}
            <header className="bg-indigo-700 p-8 rounded-3xl shadow-xl text-white">
              <h1 className="text-3xl font-black uppercase tracking-tight">Which papers do I need?</h1>
              <p className="mt-2 text-indigo-100 font-medium">Select your business type below to see the licenses required in Kenya.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Business Picker */}
              <div className="md:col-span-1 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2">My Business Is:</p>
                <div className="space-y-2">
                  {Object.keys(SIMPLE_REQS).map((name) => (
                    <button 
                      key={name}
                      onClick={() => setSelectedBusiness(name)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                        selectedBusiness === name 
                        ? "bg-white dark:bg-slate-800 border-indigo-600 text-indigo-600 shadow-md" 
                        : "bg-transparent border-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirement Cards */}
              <div className="md:col-span-2 space-y-4">
                {SIMPLE_REQS[selectedBusiness].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-start space-x-5">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl">
                      <CheckBadgeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.paper}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <BuildingLibraryIcon className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Get it from: {item.who}</p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 italic">"{item.why}"</p>
                    </div>
                  </div>
                ))}

                {/* Turnover Warning */}
                <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 p-6 rounded-3xl mt-6">
                  <div className="flex items-center space-x-4">
                    <ExclamationTriangleIcon className="h-8 w-8 text-rose-600 flex-shrink-0" />
                    <p className="text-sm text-rose-900 dark:text-rose-300">
                      <strong>Important:</strong> If your business makes more than <strong>5 Million Shillings</strong> in a year, you must talk to KRA about <strong>VAT</strong>. Don't wait!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}