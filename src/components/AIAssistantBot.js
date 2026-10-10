import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  MessageSquare,
  Building2,
  BrainCircuit,
  Send,
  Ambulance,
  Stethoscope,
  BedDouble,
  Microscope,
  Pill,
  Activity,
  CheckCircle2,
  Clock,
  User,
  Shield,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import robotLottie from './Robot-Bot 3D.lottie';

// ─── Static Hospital Facilities Data ──────────────────────────────────────────
const hospitalFacilities = [
  {
    icon: <Ambulance className="w-6 h-6 text-rosegold-500" />,
    title: '24/7 Emergency & Trauma Care',
    tag: 'LEVEL 1 TRAUMA',
    desc: 'Immediate resuscitation with zero-wait ambulance triage, synchronized ICU bed reservations, and acute surgical readiness.',
    specs: ['Zero-wait admission', 'Mobile ICU ambulances', 'Trauma surgeons on-call 24/7']
  },
  {
    icon: <BedDouble className="w-6 h-6 text-rosegold-500" />,
    title: 'Smart ICU & Ward Orchestration',
    tag: '100+ SMART BEDS',
    desc: 'Real-time bed grid telemetry displaying occupancy, ventilator allocation, and automated sanitization notifications.',
    specs: ['Live telemetry monitoring', 'Isolation ICU units', 'Instant bed booking engine']
  },
  {
    icon: <Stethoscope className="w-6 h-6 text-rosegold-500" />,
    title: 'Multi-Specialty Clinical Excellence',
    tag: '50+ SENIOR PHYSICIANS',
    desc: 'Comprehensive outpatient & inpatient care across Cardiology, Neurology, Orthopedics, Pediatrics, and General Surgery.',
    specs: ['Board-certified doctors', 'Minimal access surgery', 'Multidisciplinary consultation']
  },
  {
    icon: <Microscope className="w-6 h-6 text-rosegold-500" />,
    title: 'Advanced Diagnostic Labs & 3T MRI',
    tag: 'SUB-HOUR REPORTS',
    desc: 'State-of-the-art 64-slice CT scanner, 3T MRI imaging, and 24/7 automated pathology lab producing sub-hour reports.',
    specs: ['3T Digital MRI & CT', '24/7 Automated pathology', 'Digital PACS report access']
  },
  {
    icon: <Pill className="w-6 h-6 text-rosegold-500" />,
    title: 'In-House 24/7 Pharmacy',
    tag: 'ALWAYS STOCKED',
    desc: 'Fully stocked pharmaceutical repository directly connected to electronic doctor prescriptions for seamless bedside delivery.',
    specs: ['100% genuine medications', '24/7 open counter', 'Home delivery support']
  },
  {
    icon: <Activity className="w-6 h-6 text-rosegold-500" />,
    title: 'Attender & Family Transparency Portal',
    tag: 'REAL-TIME TRACKING',
    desc: 'Dedicated portal for family members to view live recovery milestones, daily prescription charts, food plans, and discharge dates.',
    specs: ['Live patient updates', 'Digital medical charts', 'Transparent billing transparency']
  }
];

// ─── Role-specific config ──────────────────────────────────────────────────────
const getRoleConfig = (role) => {
  switch (role) {
    case 'attender':
      return {
        label: 'Patient Assistant',
        color: 'text-rosegold-400',
        badge: 'bg-rosegold-500/20 text-rosegold-300 border-rosegold-500/30',
        icon: <User className="w-3.5 h-3.5" />,
        welcome: "Hello! I'm your personal AI Health Assistant for VK Hospital. I have access to your medical records and can answer questions about your diagnosis, medicines, treatment plan, and upcoming check-ups. How can I help you today?",
        placeholder: 'Ask about your medicines, diagnosis, or treatment...',
        quickActions: [
          { label: 'My Medicines', query: 'What medicines have been prescribed to me and when should I take them?', icon: <Pill className="w-3 h-3" /> },
          { label: 'My Diagnosis', query: 'Can you explain my diagnosis and current condition to me?', icon: <Stethoscope className="w-3 h-3" /> },
          { label: 'Discharge Date', query: 'When is my estimated discharge date and what are my upcoming appointments?', icon: <Clock className="w-3 h-3" /> },
          { label: 'Food Plan', query: 'What is my prescribed food and nutrition plan?', icon: <Activity className="w-3 h-3" /> }
        ]
      };
    case 'doctor':
      return {
        label: 'Clinical Assistant',
        color: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: <Stethoscope className="w-3.5 h-3.5" />,
        welcome: "Hello, Doctor! I'm your AI Clinical Assistant. I have access to your currently assigned patients' records. You can ask me about any of your patients, request clinical summaries, check medication plans, or get general medical reference information. How can I assist you?",
        placeholder: 'Ask about your patients or clinical queries...',
        quickActions: [
          { label: 'Patient List', query: 'Give me a summary of all my currently admitted patients and their conditions.', icon: <User className="w-3 h-3" /> },
          { label: 'Critical Patients', query: 'Which of my patients have low recovery progress or need attention?', icon: <AlertTriangle className="w-3 h-3" /> },
          { label: 'Pending Checkups', query: 'Which of my patients have upcoming check-up dates soon?', icon: <Clock className="w-3 h-3" /> },
          { label: 'Billing Status', query: 'Which of my patients have unpaid or pending billing status?', icon: <Activity className="w-3 h-3" /> }
        ]
      };
    case 'admin':
      return {
        label: 'Admin Assistant',
        color: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: <Shield className="w-3.5 h-3.5" />,
        welcome: "Hello, Administrator! I'm your AI Hospital Management Assistant. I have access to live hospital data including bed availability, patient flow, doctor workload, and admission statistics. How can I help you today?",
        placeholder: 'Ask about beds, patients, doctors, or hospital operations...',
        quickActions: [
          { label: 'Bed Availability', query: 'How many beds are currently available and how is the occupancy across floors?', icon: <BedDouble className="w-3 h-3" /> },
          { label: 'Patient Flow', query: 'Give me an overview of current patient admissions and discharges.', icon: <Activity className="w-3 h-3" /> },
          { label: 'Doctor Workload', query: 'How is the patient load distributed across the doctors?', icon: <Stethoscope className="w-3 h-3" /> },
          { label: 'Hospital Summary', query: 'Give me a complete overview of the hospital status right now.', icon: <Building2 className="w-3 h-3" /> }
        ]
      };
    default:
      return {
        label: 'Hospital AI',
        color: 'text-rosegold-400',
        badge: 'bg-slate-700 text-slate-300 border-slate-600',
        icon: <BrainCircuit className="w-3.5 h-3.5" />,
        welcome: "Hello! I'm HealthBot, the AI Assistant for VK Hospital. Please log in to access personalized assistance based on your role.",
        placeholder: 'Ask about VK Hospital...',
        quickActions: [
          { label: 'Emergency', query: 'What are the emergency contact details for VK Hospital?', icon: <Ambulance className="w-3 h-3" /> },
          { label: 'Find Specialist', query: 'Which doctor specialists are available at VK Hospital?', icon: <Stethoscope className="w-3 h-3" /> },
          { label: 'Smart Beds', query: 'How does the smart bed and ICU system work?', icon: <BedDouble className="w-3 h-3" /> },
          { label: 'Visiting Hours', query: 'What are the visiting hours for ward patients?', icon: <Clock className="w-3 h-3" /> }
        ]
      };
  }
};

// ─── Fallback responses for public (unauthenticated) visitors ──────────────────
const getPublicResponse = (query) => {
  const q = query.toLowerCase();
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Greetings! Welcome to VK Hospital. I am your AI Health Assistant. Please log in to access personalized medical assistance based on your role!';
  }
  if (q.includes('emergency') || q.includes('ambulance')) {
    return 'VK Hospital operates a zero-wait 24/7 Emergency & Level-1 Trauma Care Center. Call +91 1800-85-2273 immediately for rapid transport.';
  }
  if (q.includes('visiting') || q.includes('visit')) {
    return 'General Ward visiting hours are 4:00 PM – 7:00 PM daily. ICU visiting hours are strictly 11:00 AM – 12:00 PM and 5:00 PM – 6:00 PM for designated family attenders.';
  }
  if (q.includes('bed') || q.includes('icu')) {
    return 'Our Smart Bed Grid continuously monitors 100+ ICU and private ward beds across all floors. Please log in to check real-time availability.';
  }
  if (q.includes('doctor') || q.includes('specialist')) {
    return 'VK Hospital features 50+ senior specialists across Cardiology, Neurology, Orthopedics, Pediatrics, and Emergency Medicine. Please visit the Doctor Portal to browse specialists.';
  }
  if (q.includes('thank')) {
    return 'You are most welcome! VK Hospital is always here to serve you with care and excellence. Stay healthy!';
  }
  return `Thank you for your query. For personalized assistance, please log in to your patient, doctor, or admin portal. For immediate help, call our helpdesk at +91 1800-85-2273.`;
};

// ─── Markdown-like text formatter ─────────────────────────────────────────────
const FormattedMessage = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bold: **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} className="flex items-start space-x-1.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rosegold-400 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s+/, '') }} />
            </div>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AIAssistantBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  // Gemini multi-turn history: [{ role: 'user'|'model', parts: [{ text }] }]
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  // Track previous user to detect login ↔ logout transitions
  const prevUserRef = useRef(user);

  const roleConfig = getRoleConfig(user?.role);

  // ── Session transition handler ──────────────────────────────────────────────
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    let welcomeText;

    if (!user && prevUser) {
      // ── User just LOGGED OUT ── clear all context and show session-ended msg
      welcomeText =
        '🔒 Your secure session has ended. All personal medical data has been cleared from this chat.\n\n' +
        "I'm now running in public mode. I can answer general questions about VK Hospital — facilities, emergency contacts, visiting hours, and more.\n\n" +
        'Please log in again anytime for personalized, role-specific assistance.';
    } else if (user && !prevUser) {
      // ── User just LOGGED IN ── show role-specific welcome
      welcomeText = roleConfig.welcome;
    } else if (user && prevUser && (user.id !== prevUser.id || user.role !== prevUser.role)) {
      // ── Different user logged in (account switch) ── clear and greet
      welcomeText =
        '🔄 Account switched. Previous session data has been cleared.\n\n' +
        roleConfig.welcome;
    } else {
      // ── Initial mount ── show appropriate welcome
      welcomeText = roleConfig.welcome;
    }

    // Fully wipe chat history and Gemini conversation context
    setMessages([{
      id: 'welcome-' + Date.now(),
      sender: 'bot',
      text: welcomeText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatHistory([]);   // Clear Gemini multi-turn history
    setInputQuery('');    // Clear any typed input
    setError(null);
  }, [user?.role, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  const sendMessage = useCallback(async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);
    setError(null);

    // ── Unauthenticated: use local fallback ──────────────────────────────
    if (!user) {
      setTimeout(() => {
        const reply = getPublicResponse(query);
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 700);
      return;
    }

    // ── Authenticated: call backend AI endpoint ──────────────────────────
    try {
      const response = await api.post('/ai/chat', {
        message: query,
        history: chatHistory
      });

      const { reply } = response.data;

      // Update Gemini conversation history for multi-turn
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: query }] },
        { role: 'model', parts: [{ text: reply }] }
      ]);

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI assistant is temporarily unavailable. Please try again.';
      setError(errMsg);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `⚠️ ${errMsg}`,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputQuery, user, chatHistory]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const welcome = {
      id: 'welcome-' + Date.now(),
      sender: 'bot',
      text: roleConfig.welcome,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcome]);
    setChatHistory([]);
    setError(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">

      {/* ── Floating 3D Lottie Robot Trigger Widget ── */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Glowing pulse ring */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rosegold-400 via-amber-300 to-rosegold-600 blur-md opacity-70 group-hover:opacity-100 animate-pulse-slow transition duration-500" />

        {/* Outer Circular Container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/90 dark:bg-slate-950/95 border-2 border-rosegold-400/80 shadow-2xl flex items-center justify-center overflow-hidden backdrop-blur-md">
          <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center">
            <DotLottieReact src={robotLottie} loop autoplay style={{ width: '100%', height: '100%' }} />
          </div>

          {/* AI Active Online Badge */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm" />
        </div>

        {/* Floating Tooltip Pill */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-rosegold-500/40 shadow-xl flex items-center space-x-2 backdrop-blur-md pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-rosegold-400 animate-spin" />
            <span>{user ? `${roleConfig.label}` : 'Ask VK Hospital AI'}</span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Main AI Assistant Drawer / Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-24 right-0 w-[92vw] sm:w-[460px] h-[600px] sm:h-[640px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl"
          >
            {/* ── Modal Header ── */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 relative">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rosegold-500/20 border border-rosegold-400/40 flex items-center justify-center relative overflow-hidden">
                  <div className="w-8 h-8">
                    <DotLottieReact src={robotLottie} loop autoplay />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-bold tracking-wide text-white">
                      VK Hospital <span className="text-rosegold-400 font-extrabold">AI Assistant</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <BrainCircuit className="w-3 h-3 text-rosegold-400" />
                    <span>Gemini 1.5 Flash</span>
                    {user && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className={`flex items-center space-x-0.5 ${roleConfig.color}`}>
                          {roleConfig.icon}
                          <span>{roleConfig.label}</span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Clear chat button */}
                {messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    title="Clear Chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Role Badge Banner (when authenticated) ── */}
            {user && (
              <div className={`px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-2 text-[11px] font-semibold`}>
                <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border ${roleConfig.badge}`}>
                  {roleConfig.icon}
                  <span>{roleConfig.label} Mode</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {user.role === 'attender' ? `Patient: ${user.name}` :
                   user.role === 'doctor' ? `Dr. ${user.name}` :
                   `Admin: ${user.username}`}
                </span>
                <span className="ml-auto text-emerald-500 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Secure Context</span>
                </span>
              </div>
            )}

            {/* ── Navigation Tabs ── */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950/80 p-1.5 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-slate-850 text-rosegold-600 dark:text-rosegold-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('facilities')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-200 ${
                  activeTab === 'facilities'
                    ? 'bg-white dark:bg-slate-850 text-rosegold-600 dark:text-rosegold-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Facilities</span>
              </button>
            </div>

            {/* ══ TAB 1: INTERACTIVE AI CHAT ══ */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">

                {/* Quick Action Pills */}
                <div className="p-2.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  {roleConfig.quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(action.query)}
                      disabled={isTyping}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-rosegold-500/10 text-rosegold-600 dark:text-rosegold-400 border border-rosegold-500/20 hover:bg-rosegold-500/20 whitespace-nowrap flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end space-x-2 max-w-[88%]">
                        {msg.sender === 'bot' && (
                          <div className="w-6 h-6 rounded-lg bg-rosegold-500/20 border border-rosegold-400/40 flex items-center justify-center flex-shrink-0 mb-1 overflow-hidden">
                            <div className="w-5 h-5">
                              <DotLottieReact src={robotLottie} loop autoplay />
                            </div>
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-rosegold-500 text-white rounded-br-none shadow-md font-medium'
                              : msg.isError
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-bl-none border border-red-200 dark:border-red-800/50 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                          }`}
                        >
                          {msg.sender === 'bot' && !msg.isError ? (
                            <FormattedMessage text={msg.text} />
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}
                          <span className="block text-[9px] mt-1 opacity-60 text-right">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-rosegold-500/20 flex items-center justify-center">
                        <DotLottieReact src={robotLottie} loop autoplay />
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-rosegold-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-rosegold-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-rosegold-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] text-slate-400 ml-1">Thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mx-3 mb-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center space-x-2 text-[11px] text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Input Bar */}
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={roleConfig.placeholder}
                    disabled={isTyping}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rosegold-500 disabled:opacity-60 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-rosegold-500 hover:bg-rosegold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-md flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* ══ TAB 2: HOSPITAL FACILITIES ══ */}
            {activeTab === 'facilities' && (
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="bg-gradient-to-r from-rosegold-500/10 via-amber-500/10 to-rosegold-500/10 p-3 rounded-2xl border border-rosegold-500/20">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-rosegold-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      VK Hospital World-Class Facilities
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    Equipped with advanced telemetry, automated bed grid tracking, and 24/7 super-specialty medical care.
                  </p>
                </div>

                {hospitalFacilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2 hover:border-rosegold-400/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-rosegold-50 dark:bg-rosegold-950/40 border border-rosegold-200/50 dark:border-rosegold-800/40">
                          {fac.icon}
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {fac.title}
                        </h5>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rosegold-500/15 text-rosegold-600 dark:text-rosegold-300 border border-rosegold-500/30">
                        {fac.tag}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {fac.desc}
                    </p>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-1.5">
                      {fac.specs.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{spec}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Footer Status Bar ── */}
            <div className="bg-slate-100 dark:bg-slate-950 px-3.5 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>VK Hospital AI • Powered by Gemini</span>
              </span>
              <span className="text-[9px]">
                {user ? `🔒 ${roleConfig.label}` : '24/7 Super-Specialty Support'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistantBot;
