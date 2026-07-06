import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  Users,
  Bed,
  Activity,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  RefreshCw,
  BellRing,
  Stethoscope
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const COLORS = ['#DEA193', '#F2D4CD', '#CD8576', '#B0695B', '#8E5044', '#69382F', '#4A231C', '#A78BFA'];

const AdminDashboard = () => {
  const socket = useSocket();
  const [analytics, setAnalytics] = useState(null);
  const [doctorsWorkload, setDoctorsWorkload] = useState([]);
  const [allBeds, setAllBeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / Selection states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, workloadRes, bedsRes, logsRes] = await Promise.all([
        api.get('/patients/analytics'),
        api.get('/doctors/workload'),
        api.get('/beds'),
        api.get('/patients/logs')
      ]);
      setAnalytics(analyticsRes.data);
      setDoctorsWorkload(workloadRes.data);
      setAllBeds(bedsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to reload analytics grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen to Socket.IO live updates
  useEffect(() => {
    if (!socket) return;

    socket.on('bed_update', (updatedBed) => {
      // 1. Update beds list in memory
      setAllBeds((prev) => prev.map((b) => (b.id === updatedBed.id ? updatedBed : b)));
      // 2. Refresh analytics to adjust floor counters
      api.get('/patients/analytics').then((res) => setAnalytics(res.data));
    });

    socket.on('new_activity', (newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 29)]);
      toast(newLog.message, {
        icon: '🔔',
        style: {
          borderRadius: '12px',
          background: '#0F172A',
          color: '#FFF',
          border: '1px solid rgba(222, 161, 147, 0.4)'
        }
      });
    });

    socket.on('new_announcement', (ann) => {
      toast.success(`Announcement: ${ann.title}`);
    });

    return () => {
      socket.off('bed_update');
      socket.off('new_activity');
      socket.off('new_announcement');
    };
  }, [socket]);

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950 flex flex-col justify-between">
        <Navbar roleTitle="Admin Hub" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-rosegold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Assembling VK Flow metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper colors for bed status badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Occupied': return 'bg-rosegold-500/10 text-rosegold-500 border-rosegold-500/20';
      case 'Reserved': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Cleaning': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'Maintenance': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const bedDistribution = [
    { name: 'Occupied', value: analytics.counters.occupiedBeds },
    { name: 'Available', value: analytics.counters.availableBeds },
    { name: 'Cleaning', value: analytics.counters.cleaningBeds },
    { name: 'Reserved', value: analytics.counters.reservedBeds },
    { name: 'Maintenance', value: analytics.counters.maintenanceBeds },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950">
      <Navbar roleTitle="Admin Hub" />
      <div className="flex">
        <Sidebar role="admin" />
        
        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Command Center</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time control grid & performance telemetry for VK Hospital.
              </p>
            </div>
            
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-rosegold-500 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Active Doctors", count: analytics.counters.doctors, subtitle: "Assigned Specialists", icon: <Stethoscope className="w-6 h-6" />, color: "from-purple-500/10 to-indigo-500/5 text-indigo-500 border-indigo-500/15" },
              { title: "Admitted Patients", count: analytics.counters.admitted, subtitle: "Receiving Clinical Care", icon: <Users className="w-6 h-6" />, color: "from-rosegold-300/15 to-rosegold-500/5 text-rosegold-500 border-rosegold-300/15" },
              { title: "Occupied Beds", count: analytics.counters.occupiedBeds, subtitle: `${analytics.counters.availableBeds} beds vacant`, icon: <Bed className="w-6 h-6" />, color: "from-red-500/10 to-amber-500/5 text-red-500 border-red-500/15" },
              { title: "Critical Discharges", count: analytics.counters.discharged, subtitle: "Total Recovered Patients", icon: <UserCheck className="w-6 h-6" />, color: "from-emerald-500/10 to-teal-500/5 text-emerald-500 border-emerald-500/15" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`glass-card p-5 rounded-2xl border bg-gradient-to-br ${item.color} shadow-sm relative overflow-hidden`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">{item.title}</span>
                    <span className="text-3xl font-extrabold tracking-tight block text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shadow-inner">
                    {item.icon}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-450 block mt-3">
                  {item.subtitle}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Interactive Sections: Doctors & Floors */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Clickable Floor Cards */}
            <div className="glass-card p-6 rounded-2xl border border-white/20 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
                <Layers className="w-5 h-5 text-rosegold-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Floors & Ward Telemetry</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any floor card below to expand the live bed allocation grid.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.floorOccupancy.map((f, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedFloor(f.floor)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 cursor-pointer text-center space-y-2 hover:border-rosegold-500 hover:glow-rosegold transition-all shadow-sm"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">{f.floor}</span>
                    <span className="text-xl font-extrabold text-rosegold-600 dark:text-rosegold-400 block">
                      {f.occupied} / {f.total}
                    </span>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rosegold-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${f.occupancyRate}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium block">
                      {f.occupancyRate}% Occupied
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Clickable Doctor Cards */}
            <div className="glass-card p-6 rounded-2xl border border-white/20 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
                <Stethoscope className="w-5 h-5 text-rosegold-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Clinical Workload Distribution</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click a physician card to inspect the patient records assigned to their care.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2">
                {doctorsWorkload.map((doc, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDoctor(doc)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 cursor-pointer flex justify-between items-center hover:border-rosegold-500 hover:glow-rosegold transition-all shadow-sm"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{doc.specialization}</span>
                    </div>
                    <div className="px-2.5 py-1 bg-rosegold-100 dark:bg-rosegold-950/30 text-rosegold-750 dark:text-rosegold-300 font-bold text-xs rounded-full border border-rosegold-200/10">
                      {doc.patientCount} Pat
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Chart 1: Floor Bed Occupancy rates */}
            <div className="xl:col-span-2 glass-card p-6 rounded-2xl border border-white/20 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Bed Allocation by Floor</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.floorOccupancy}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="floor" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="occupied" name="Occupied Beds" fill="#DEA193" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total Beds Capacity" fill="#F2D4CD" opacity={0.4} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Bed Status distribution */}
            <div className="glass-card p-6 rounded-2xl border border-white/20 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Bed Capacity Breakdown</h3>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bedDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {bedDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {bedDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Activities and Notifications */}
          <div className="glass-card p-6 rounded-2xl border border-white/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
              <div className="flex items-center space-x-2">
                <BellRing className="w-5 h-5 text-rosegold-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">VK Telemetry Audit Log</h3>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                Live Feed
              </span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-450">No activity recorded today.</div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/30 dark:bg-slate-900/30 rounded-xl border border-slate-200/30 dark:border-slate-800/30 flex items-start space-x-3 text-xs"
                  >
                    <span className={`p-1.5 rounded-lg border font-bold text-[9px] uppercase tracking-wide shrink-0 ${
                      log.type === 'Admission' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      log.type === 'Discharge' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                      log.type === 'Bed_Update' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {log.type.split('_')[0]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{log.message}</p>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                        <span>by {log.user}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

      {/* MODAL 1: Clicked Doctor - Patients List */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedDoctor.name}</h3>
                  <p className="text-xs text-rosegold-600 dark:text-rosegold-400 font-semibold">{selectedDoctor.specialization} Case Load</p>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {selectedDoctor.patients.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-semibold text-slate-500">No active patients currently assigned.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-955 text-slate-550 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                          <th className="p-3 pl-4">Patient</th>
                          <th className="p-3">Bed / Room</th>
                          <th className="p-3">Disease</th>
                          <th className="p-3">Admitted</th>
                          <th className="p-3 pr-4">Recovery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                        {selectedDoctor.patients.map((pat, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                            <td className="p-3 pl-4 font-bold text-slate-850 dark:text-white">
                              {pat.name} <span className="text-[10px] text-slate-450 font-medium block">{pat.id}</span>
                            </td>
                            <td className="p-3">{pat.bedId} ({pat.ward})</td>
                            <td className="p-3">{pat.disease}</td>
                            <td className="p-3">{new Date(pat.admissionDate).toLocaleDateString()}</td>
                            <td className="p-3 pr-4">
                              <span className="px-2 py-0.5 rounded bg-rosegold-500/10 text-rosegold-500 font-bold text-[10px]">
                                {pat.recoveryProgress}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Clicked Floor - Bed Layout grid */}
      <AnimatePresence>
        {selectedFloor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedFloor} Floor Bed Grid</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Visual mapping of live bed occupancy, cleaning cycles, and maintenance status.</p>
                </div>
                <button
                  onClick={() => setSelectedFloor(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {allBeds.filter((b) => b.floor === selectedFloor).length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Bed className="w-10 h-10 mx-auto text-slate-350" />
                    <p className="text-xs text-slate-500 font-semibold">No beds assigned to this section.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {allBeds
                      .filter((b) => b.floor === selectedFloor)
                      .map((bed, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center relative overflow-hidden space-y-2"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{bed.bedNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getStatusColor(bed.status)}`}>
                              {bed.status}
                            </span>
                          </div>
                          
                          <div className="pt-2 text-left space-y-1">
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 block truncate">Ward: {bed.ward}</span>
                            {bed.patientId && (
                              <span className="text-[10px] font-bold text-rosegold-500 block truncate">Patient: {bed.patientId}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
