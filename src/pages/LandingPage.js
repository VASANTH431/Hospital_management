import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  User,
  Shield,
  Stethoscope,
  ChevronRight,
  Activity,
  Clock,
  Award,
  BedDouble,
  Pill,
  Microscope,
  Ambulance,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  LogIn,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPortals, setShowPortals] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = "Real-Time Patient Flow Optimization & Bed Capacity Orchestration";

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('vk_theme') === 'dark' ||
      (!localStorage.getItem('vk_theme') && window.matchMedia('(pre-matches-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('vk_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('vk_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    // If URL has ?portals=true or ?login=true, show portals directly
    if (searchParams.get('portals') === 'true' || searchParams.get('login') === 'true') {
      setShowPortals(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setTypedText(fullText.substring(0, index));
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
      tag: "ATTENDER"
    },
    {
      title: "Doctor Portal",
      description: "Access physician dashboards, manage clinical profiles, admit/discharge patients, and coordinate bed bookings.",
      icon: <Stethoscope className="w-8 h-8 text-rosegold-500" />,
      color: "from-rosegold-200/60 to-rosegold-300/40 dark:from-rosegold-950/30 dark:to-rosegold-900/20",
      path: "/login?role=doctor",
      tag: "PHYSICIAN"
    },
    {
      title: "Admin Portal",
      description: "Hospital administration, doctor registration, billing audit, bed grid layout configuration, and real-time flow analytics.",
      icon: <Shield className="w-8 h-8 text-rosegold-500" />,
      color: "from-rosegold-300/40 to-rosegold-400/20 dark:from-rosegold-950/40 dark:to-rosegold-900/30",
      path: "/login?role=admin",
      tag: "ADMINISTRATOR"
    }
  ];

  const facilities = [
    {
      icon: <Ambulance className="w-7 h-7 text-rosegold-500" />,
      title: "24/7 Emergency & Trauma Care",
      description: "Immediate critical care triage with zero-wait ambulance admissions and synchronized ICU bed allocation.",
      highlight: "Instant Triage & Priority Care"
    },
    {
      icon: <BedDouble className="w-7 h-7 text-rosegold-500" />,
      title: "Smart ICU & Ward Orchestration",
      description: "Live bed occupancy grid tracked across all floors, with automated cleaning and turnover notifications.",
      highlight: "Real-Time Telemetry Sync"
    },
    {
      icon: <Stethoscope className="w-7 h-7 text-rosegold-500" />,
      title: "Multi-Specialty Clinical Excellence",
      description: "Top-tier medical specialists in Cardiology, Neurology, Orthopedics, Pediatrics, and Emergency Medicine.",
      highlight: "50+ Senior Physicians"
    },
    {
      icon: <Microscope className="w-7 h-7 text-rosegold-500" />,
      title: "Advanced Diagnostic Labs & Imaging",
      description: "High-precision 64-slice CT scans, 3T MRI imaging, and 24/7 automated pathology lab testing.",
      highlight: "Sub-hour Report Generation"
    },
    {
      icon: <Pill className="w-7 h-7 text-rosegold-500" />,
      title: "In-House Pharmacy & Express Care",
      description: "Fully stocked pharmaceutical repository synced with doctor e-prescriptions and patient care charts.",
      highlight: "24/7 Medicine Availability"
    },
    {
      icon: <Activity className="w-7 h-7 text-rosegold-500" />,
      title: "Live Patient Flow Transparency",
      description: "Dedicated portal for patient attenders to track recovery milestones, diet plans, and discharge updates.",
      highlight: "Family Portal Access"
    }
  ];

  const stats = [
    { label: "Senior Specialists", value: "50+", icon: <Award className="w-5 h-5 text-rosegold-500" /> },
    { label: "Emergency Response", value: "< 10 Min", icon: <Clock className="w-5 h-5 text-rosegold-500" /> },
    { label: "Smart Beds & ICU", value: "100+", icon: <BedDouble className="w-5 h-5 text-rosegold-500" /> },
    { label: "Patient Care Satisfaction", value: "99.8%", icon: <CheckCircle2 className="w-5 h-5 text-rosegold-500" /> }
  ];

  const specialties = [
    { title: "Cardiology", desc: "Advanced cardiac intervention, ECG monitoring, and heart failure care." },
    { title: "Neurology", desc: "Stroke unit, neuro-intensive care, and brain surgery excellence." },
    { title: "Pediatrics", desc: "Child care, neonatal ICU, and compassionate pediatric wellness." },
    { title: "Orthopedics", desc: "Joint replacement, trauma reconstruction, and sports injury rehabilitation." },
    { title: "Emergency Medicine", desc: "Round-the-clock level 1 trauma resuscitation and acute life support." }
  ];

  const scrollToFacilities = () => {
    const element = document.getElementById('facilities-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950 relative overflow-x-hidden particle-grid flex flex-col justify-between">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rosegold-100/40 dark:bg-rosegold-900/10 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rosegold-200/30 dark:bg-rosegold-950/15 filter blur-[120px] pointer-events-none" />

      {/* Top Header / Navigation */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between z-20 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowPortals(false)}>
          <div className="w-10 h-10 rounded-xl bg-rosegold-500 flex items-center justify-center glow-rosegold relative">
            <Heart className="w-5 h-5 text-white animate-heartbeat" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            VK <span className="text-rosegold-500">Hospital</span>
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Theme Switcher Button (Custom Squircle Style matching screenshot) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center shadow-sm hover:shadow transition-all duration-300"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 stroke-[1.75]" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 stroke-[1.75]" />
            )}
          </button>

          {!showPortals ? (
            <>
              <button
                onClick={scrollToFacilities}
                className="hidden sm:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rosegold-500 dark:hover:text-rosegold-400 transition-colors"
              >
                Facilities
              </button>
              <button
                onClick={() => setShowPortals(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-rosegold-500 hover:bg-rosegold-600 text-white rounded-xl text-xs font-semibold glow-rosegold hover:glow-rosegold-strong transition-all duration-300 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowPortals(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rosegold-600 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hospital Details</span>
            </button>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:block">
            V1.0.0
          </div>
        </div>
      </header>

      {/* ANImated VIEW SWITCHER */}
      <AnimatePresence mode="wait">
        {showPortals ? (
          /* ========================================================= */
          /* PORTAL ROLE SELECTION VIEW (SCREENSHOT MATCHING UI)        */
          /* ========================================================= */
          <motion.main
            key="portals-view"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto w-full my-auto py-12 px-4 sm:px-6 lg:px-8 z-10 flex flex-col items-center"
          >
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="px-4 py-1.5 rounded-full border border-rosegold-300/40 dark:border-rosegold-800/30 bg-rosegold-50 dark:bg-rosegold-950/30 text-rosegold-600 dark:text-rosegold-400 text-xs font-semibold uppercase tracking-wider mb-6 flex items-center space-x-2"
            >
              <Heart className="w-3.5 h-3.5 text-rosegold-500 animate-heartbeat" fill="currentColor" />
              <span>VK HOSPITAL FLOW ORCHESTRATOR</span>
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
                  transition={{ duration: 0.6, delay: 0.15 + index * 0.12 }}
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

            <button
              onClick={() => setShowPortals(false)}
              className="mt-12 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rosegold-500 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to VK Hospital Information Landing Page</span>
            </button>
          </motion.main>
        ) : (
          /* ========================================================= */
          /* FULL HOSPITAL LANDING PAGE WITH DETAILS & FACILITIES      */
          /* ========================================================= */
          <motion.main
            key="details-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto w-full z-10 px-4 sm:px-6 lg:px-8 py-8 space-y-20"
          >
            {/* HERO SECTION */}
            <section className="flex flex-col items-center text-center pt-8 pb-12 relative">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-1.5 rounded-full border border-rosegold-300/40 bg-rosegold-50 dark:bg-rosegold-950/30 text-rosegold-600 dark:text-rosegold-400 text-xs font-semibold uppercase tracking-wider mb-6 flex items-center space-x-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-rosegold-500 animate-pulse" />
                <span>Premier Multi-Specialty Tertiary Care Center</span>
              </motion.div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15] max-w-5xl">
                Advanced Healthcare <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosegold-400 via-rosegold-500 to-rosegold-700">
                  Driven by Real-Time Innovation
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-350 max-w-2xl font-normal leading-relaxed">
                VK Hospital combines world-class medical expertise, cutting-edge diagnostic technology, and real-time patient bed flow orchestration for seamless healing.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setShowPortals(true)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-rosegold-500 hover:bg-rosegold-600 text-white font-semibold text-sm rounded-xl glow-rosegold hover:glow-rosegold-strong transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Access Login Portals</span>
                </button>
                <button
                  onClick={scrollToFacilities}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl backdrop-blur-md hover:border-rosegold-400 hover:text-rosegold-600 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Explore Hospital Facilities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mt-16">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="glass-card rounded-2xl p-5 border border-white/20 text-center flex flex-col items-center justify-center shadow-sm hover:border-rosegold-300 transition-colors"
                  >
                    <div className="p-2 bg-rosegold-50 dark:bg-rosegold-950/40 rounded-xl mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ECG Divider */}
            <div className="w-full h-8 flex items-center justify-center text-rosegold-500/50">
              <svg className="w-64 h-full" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path className="ecg-path" d="M 0 10 H 35 L 38 6 L 42 16 L 46 2 L 50 15 L 53 8 L 57 10 H 100" strokeDasharray="300" strokeDashoffset="300" />
              </svg>
            </div>

            {/* FACILITIES SECTION */}
            <section id="facilities-section" className="space-y-10 scroll-mt-24">
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rosegold-600 dark:text-rosegold-400 bg-rosegold-50 dark:bg-rosegold-950/40 px-3 py-1 rounded-full inline-block border border-rosegold-200/50">
                  World-Class Amenities
                </h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Hospital Facilities & Clinical Services
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Designed around patient care efficiency, safety, and modern medical technology to provide an unparalleled clinical environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((fac, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    whileHover={{ y: -5 }}
                    className="glass-card rounded-2xl p-6 border border-white/20 shadow-sm relative group overflow-hidden flex flex-col justify-between hover:border-rosegold-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-inner border border-rosegold-100/30 group-hover:scale-110 transition-transform duration-300">
                          {fac.icon}
                        </div>
                        <span className="text-[10px] font-bold text-rosegold-700 dark:text-rosegold-300 bg-rosegold-100/60 dark:bg-rosegold-900/40 px-2.5 py-0.5 rounded-md border border-rosegold-200/40">
                          {fac.highlight}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rosegold-500 transition-colors">
                        {fac.title}
                      </h4>

                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {fac.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-rosegold-600 dark:text-rosegold-400">
                      <span>Available 24 Hours</span>
                      <CheckCircle2 className="w-4 h-4 text-rosegold-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SPECIALTIES HIGHLIGHT SECTION */}
            <section className="glass-card rounded-3xl p-8 sm:p-12 border border-white/30 relative overflow-hidden shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-rosegold-600 dark:text-rosegold-400">
                    Clinical Departments
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Specialized Medical Centers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Our team of experienced consultants and nursing staff collaborate using our real-time flow orchestrator to deliver prompt medical care.
                  </p>
                  <button
                    onClick={() => setShowPortals(true)}
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-rosegold-600 dark:text-rosegold-400 hover:text-rosegold-700 transition-colors pt-2"
                  >
                    <span>Login to Doctor & Patient Portals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specialties.map((spec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 hover:border-rosegold-300 transition-colors">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-rosegold-500" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{spec.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{spec.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* EMERGENCY CONTACT & LOCATION BANNER */}
            <section className="bg-gradient-to-r from-rosegold-500 to-rosegold-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Ambulance className="w-5 h-5 text-rosegold-100" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rosegold-100">24/7 Emergency Triage Dispatch</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold">Need Immediate Medical Assistance?</h3>
                <p className="text-xs text-rosegold-100 max-w-xl">
                  Contact our round-the-clock emergency desk for immediate ambulance routing and real-time bed reservations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <a
                  href="tel:18001234567"
                  className="px-6 py-3 bg-white text-rosegold-700 font-bold text-xs rounded-xl shadow-md hover:bg-rosegold-50 transition-colors flex items-center space-x-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency: 1800-VK-CARE</span>
                </a>
                <button
                  onClick={() => setShowPortals(true)}
                  className="px-6 py-3 bg-rosegold-900/30 border border-white/30 text-white font-semibold text-xs rounded-xl hover:bg-rosegold-900/50 transition-colors flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Role Login</span>
                </button>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-400 dark:text-slate-600 z-10 border-t border-slate-200/40 dark:border-slate-800/40 py-6 px-4 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-rosegold-500 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">VK Hospital Flow Management System</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
            <span className="hover:text-rosegold-500 cursor-pointer" onClick={() => setShowPortals(false)}>Overview</span>
            <span className="hover:text-rosegold-500 cursor-pointer" onClick={scrollToFacilities}>Facilities</span>
            <span className="hover:text-rosegold-500 cursor-pointer" onClick={() => setShowPortals(true)}>Portals</span>
          </div>
        </div>
        <p>&copy; 2026 VK Hospital Care Group. All rights reserved. Designed with Rose Gold clinical design system.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
