import React, { useState, useEffect, useRef } from 'react';
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
  Clock
} from 'lucide-react';
import robotLottie from './Robot-Bot 3D.lottie';

// Initial trained baseline knowledge for VK Hospital
const INITIAL_TRAINED_KNOWLEDGE = [
  {
    id: 'k1',
    category: 'Hospital Info',
    keyword: 'vk hospital location address name contact phone',
    question: 'What is VK Hospital and how to contact?',
    answer: 'VK Hospital is a premier 24/7 super-specialty medical center dedicated to real-time patient care, smart ICU orchestration, and advanced clinical treatment. Contact emergency desk at +91 1800-VK-CARE (1800-85-2273) or info@vkhospital.com.'
  },
  {
    id: 'k2',
    category: 'Emergency & Ambulance',
    keyword: 'emergency trauma ambulance casualty 24/7 ICU triage',
    question: 'How to reach emergency & trauma care?',
    answer: 'VK Hospital operates a zero-wait 24/7 Emergency & Level-1 Trauma Care Center with direct telemetry sync to ICU beds and dedicated ambulance dispatch. Call +91 1800-85-2273 immediately for rapid transport.'
  },
  {
    id: 'k3',
    category: 'Specialties & Doctors',
    keyword: 'doctor cardiology neurology orthopedics pediatrics specialists consultation',
    question: 'What medical specialties and doctors are available?',
    answer: 'VK Hospital features 50+ senior specialists across Cardiology, Neurology, Orthopedics, Pediatrics, and Emergency Medicine. You can browse specialists and schedule consultations via our Doctor Portal.'
  },
  {
    id: 'k4',
    category: 'Visiting Hours',
    keyword: 'visiting hours attender timings patient visits ward',
    question: 'What are the patient visiting hours?',
    answer: 'General Ward visiting hours are 4:00 PM – 7:00 PM daily. ICU visiting hours are strictly 11:00 AM – 12:00 PM and 5:00 PM – 6:00 PM for designated family attenders with digital passes.'
  },
  {
    id: 'k5',
    category: 'Bed & ICU Availability',
    keyword: 'bed status icu room booking ward availability occupancy',
    question: 'How does real-time bed & ICU allocation work?',
    answer: 'Our Smart Bed Grid continuously monitors 100+ ICU and private ward beds across all floors, offering real-time telemetry sync, automated cleaning alerts, and swift doctor booking.'
  },
  {
    id: 'k6',
    category: 'Diagnostics & Pharmacy',
    keyword: 'lab scan MRI CT scan X-ray pathology pharmacy medicine',
    question: 'What diagnostic labs and pharmacy facilities are inside?',
    answer: 'We house high-precision 64-slice CT, 3T MRI, fully automated 24/7 pathology labs (sub-hour test report generation), and an in-house round-the-clock pharmacy synced with e-prescriptions.'
  }
];

const AIAssistantBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'facilities'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am HealthBot 3D, the AI Virtual Assistant for **VK Hospital**. How can I help you today? Ask me about our 24/7 facilities, doctors, bed status, or general inquiries!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Trained Knowledge Base State (persisted internally)
  const [trainedKnowledge] = useState(() => {
    try {
      const saved = localStorage.getItem('vk_hospital_ai_trained_data');
      return saved ? JSON.parse(saved) : INITIAL_TRAINED_KNOWLEDGE;
    } catch (e) {
      return INITIAL_TRAINED_KNOWLEDGE;
    }
  });

  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isTyping]);

  // Handle user query submission & AI response matching
  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simulate AI model inference process
    setTimeout(() => {
      const botReply = generateAIResponse(query.trim(), trainedKnowledge);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply.text,
        isTrainedMatch: botReply.isTrainedMatch,
        matchedCategory: botReply.matchedCategory,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  // AI Response Engine with Trained Knowledge Search
  const generateAIResponse = (userQuery, knowledgeBase) => {
    const lowerQuery = userQuery.toLowerCase();

    // 1. Search knowledge base
    let bestMatch = null;
    let maxScore = 0;

    for (const item of knowledgeBase) {
      const keywords = (item.keyword + ' ' + item.question + ' ' + item.category).toLowerCase().split(/\s+/);
      let matchCount = 0;
      keywords.forEach((kw) => {
        if (kw.length > 2 && lowerQuery.includes(kw)) {
          matchCount++;
        }
      });

      if (matchCount > maxScore) {
        maxScore = matchCount;
        bestMatch = item;
      }
    }

    if (bestMatch && maxScore >= 1) {
      return {
        text: bestMatch.answer,
        isTrainedMatch: true,
        matchedCategory: bestMatch.category
      };
    }

    // 2. Default intelligent fallbacks for VK Hospital
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return {
        text: 'Greetings! Welcome to **VK Hospital**. I am your 3D AI Health Assistant. How can I assist you with appointments, emergency services, or facility details today?'
      };
    }

    if (lowerQuery.includes('thank') || lowerQuery.includes('thanks')) {
      return {
        text: 'You are most welcome! VK Hospital is always here to serve you with care and excellence. Stay healthy!'
      };
    }

    return {
      text: `I have processed your query regarding "${userQuery}". Based on VK Hospital clinical guidance, our medical team is available 24/7. You can explore our Facilities tab for comprehensive service information!`,
      isTrainedMatch: false
    };
  };

  // Facilities data for VK Hospital
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating 3D Lottie Robot Trigger Widget */}
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
          {/* 3D DotLottie Player */}
          <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center">
            <DotLottieReact
              src={robotLottie}
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
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
            <span>Ask VK Hospital AI</span>
          </motion.div>
        )}
      </motion.div>

      {/* Main AI Assistant Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-20 right-0 w-[92vw] sm:w-[440px] h-[580px] sm:h-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl"
          >
            {/* Modal Header */}
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
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <BrainCircuit className="w-3 h-3 text-rosegold-400" />
                    <span>Model: VK-HealthGPT v2.4</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (AI Chat & Facilities Only) */}
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

            {/* TAB 1: INTERACTIVE AI CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                {/* Quick Action Pills */}
                <div className="p-2.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => handleSendMessage('What are the emergency contact details for VK Hospital?')}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 whitespace-nowrap flex items-center space-x-1"
                  >
                    <Ambulance className="w-3 h-3" />
                    <span>Emergency Care</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Which doctor specialists are available at VK Hospital?')}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-rosegold-500/10 text-rosegold-600 dark:text-rosegold-400 border border-rosegold-500/20 hover:bg-rosegold-500/20 whitespace-nowrap flex items-center space-x-1"
                  >
                    <Stethoscope className="w-3 h-3" />
                    <span>Find Specialist</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('How do I check ICU and smart bed availability?')}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 whitespace-nowrap flex items-center space-x-1"
                  >
                    <BedDouble className="w-3 h-3" />
                    <span>Smart Beds</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('What are the visiting hours for ward patients?')}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 whitespace-nowrap flex items-center space-x-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Visiting Hours</span>
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end space-x-2 max-w-[85%]">
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
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className="block text-[9px] mt-1 opacity-70 text-right">
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
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-rosegold-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-rosegold-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-rosegold-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask HealthBot about VK Hospital..."
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rosegold-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="p-2.5 rounded-xl bg-rosegold-500 hover:bg-rosegold-600 disabled:opacity-40 text-white transition-all duration-200 shadow-md flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: HOSPITAL FACILITIES */}
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

            {/* Footer Status Bar */}
            <div className="bg-slate-100 dark:bg-slate-950 px-3.5 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>VK Hospital AI v2.4</span>
              </span>
              <span>24/7 Super-Specialty Medical Support</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistantBot;
