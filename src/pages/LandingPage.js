import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Shield, Stethoscope, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const fullText = "Real-Time Patient Flow Optimization & Bed Capacity Orchestration";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const portals = [
    {
      title: "Patient Attender Portal",
      description: "Log in using the patient ID to check treatment updates, medicine charts, food plans, and discharge status.",
      icon: <User className="w-8 h-8 text-rosegold-500" />,
      color: "from-rosegold-100 to-rosegold-200/50 dark:from-rosegold-950/20 dark:to-rosegold-900/10",
      path: "/login?role=attender",
      tag: "Attender"
    },
    {
      title: "Doctor Portal",
      description: "Access physician dashboards, manage clinical profiles, admit/discharge patients, and coordinate bed bookings.",
      icon: <Stethoscope className="w-8 h-8 text-rosegold-500" />,
      color: "from-rosegold-200/60 to-rosegold-300/40 dark:from-rosegold-950/30 dark:to-rosegold-900/20",
      path: "/login?role=doctor",
      tag: "Physician"
    },
    {
      title: "Admin Portal",
      description: "Hospital administration, doctor registration, billing audit, bed grid layout configuration, and real-time flow analytics.",
      icon: <Shield className="w-8 h-8 text-rosegold-500" />,
      color: "from-rosegold-300/40 to-rosegold-400/20 dark:from-rosegold-950/40 dark:to-rosegold-900/30",
      path: "/login?role=admin",
      tag: "Administrator"
    }
  ];

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950 relative overflow-hidden particle-grid flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rosegold-100/40 dark:bg-rosegold-900/10 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rosegold-200/30 dark:bg-rosegold-950/15 filter blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rosegold-500 flex items-center justify-center glow-rosegold relative">
            <Heart className="w-5 h-5 text-white animate-heartbeat" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            VK <span className="text-rosegold-500">Hospital</span>
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          V1.0.0
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full my-auto py-12 z-10 flex flex-col items-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-4 py-1.5 rounded-full border border-rosegold-300/40 dark:border-rosegold-800/30 bg-rosegold-50 dark:bg-rosegold-950/30 text-rosegold-600 dark:text-rosegold-400 text-xs font-semibold uppercase tracking-wider mb-6 flex items-center space-x-2"
        >
          <Heart className="w-3.5 h-3.5 text-rosegold-500 animate-heartbeat" fill="currentColor" />
          <span>VK Hospital Flow Orchestrator</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center tracking-tight text-slate-950 dark:text-white leading-tight max-w-4xl"
        >
          Care Flow, Optimized. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosegold-400 to-rosegold-600 dark:from-rosegold-300 dark:to-rosegold-500">
            Beds, Synced In Real-Time.
          </span>
        </motion.h1>

        {/* Typing Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 text-center max-w-2xl min-h-[3.5rem] font-medium leading-relaxed">
          {typedText}
          <span className="animate-pulse text-rosegold-500">|</span>
        </p>

        {/* ECG visual line divider */}
        <div className="w-48 h-8 my-4 flex items-center justify-center text-rosegold-500/60">
          <svg className="w-full h-full" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path className="ecg-path" d="M 0 10 H 35 L 38 6 L 42 16 L 46 2 L 50 15 L 53 8 L 57 10 H 100" strokeDasharray="300" strokeDashoffset="300" />
          </svg>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-10">
          {portals.map((portal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer rounded-2xl p-6 glass-card bg-gradient-to-br border border-white/20 relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:glow-rosegold"
              onClick={() => navigate(portal.path)}
            >
              {/* Highlight background element on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-rosegold-400/5 to-rosegold-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-inner border border-rosegold-100/20">
                  {portal.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rosegold-200/50 dark:bg-rosegold-900/30 text-rosegold-700 dark:text-rosegold-300 px-2.5 py-1 rounded-full">
                  {portal.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rosegold-500 transition-colors duration-300">
                {portal.title}
              </h3>
              
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {portal.description}
              </p>

              <div className="mt-6 flex items-center text-xs font-semibold text-rosegold-600 dark:text-rosegold-400 group-hover:translate-x-1.5 transition-transform duration-300">
                <span>Enter Portal</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-400 dark:text-slate-600 z-10 border-t border-slate-200/40 dark:border-slate-800/40 pt-6 mt-12">
        <p>&copy; 2026 VK Hospital Care Group. All rights reserved. Designed with Rose Gold clinical design tokens.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
