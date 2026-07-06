import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import {
  Calendar,
  Heart,
  Stethoscope,
  Activity,
  Bed,
  FileText,
  DollarSign,
  Info,
  Clock,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

const AttenderDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [patientData, setPatientData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientInfo = async () => {
    try {
      const [infoRes, annRes] = await Promise.all([
        api.get(`/patients/${user.id}`),
        api.get('/patients/announcements')
      ]);
      setPatientData(infoRes.data.patient);
      setDoctorData(infoRes.data.doctor);
      setAnnouncements(annRes.data);
    } catch (error) {
      toast.error('Failed to sync patient file');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatientInfo();
    }
  }, [user]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket || !patientData) return;

    socket.on('patient_update', (updatedPatient) => {
      if (updatedPatient.id === patientData.id) {
        setPatientData(updatedPatient);
        toast.info('Clinical records updated by physician.');
      }
    });

    socket.on('new_announcement', (ann) => {
      setAnnouncements((prev) => [ann, ...prev]);
      toast('New announcement from VK Administration.', { icon: '📣' });
    });

    return () => {
      socket.off('patient_update');
      socket.off('new_announcement');
    };
  }, [socket, patientData]);

  if (loading || !patientData) {
    return (
      <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950 flex flex-col justify-between">
        <Navbar roleTitle="Care Companion" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-rosegold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">Syncing VK Clinical records...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950 pb-12">
      <Navbar roleTitle="Attender Hub" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Patient Status Banner */}
        <div className="glass-card rounded-3xl border border-white/20 p-6 md:p-8 shadow-md bg-gradient-to-r from-rosegold-100/30 via-rosegold-200/10 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-rosegold-750 dark:text-rosegold-400 bg-rosegold-100 dark:bg-rosegold-950/20 px-3 py-1 rounded-full border border-rosegold-200/10">
              Active Case: {patientData.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{patientData.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {patientData.age} Years Old • {patientData.gender} • Blood Group: <strong className="text-rosegold-600">{patientData.bloodGroup}</strong>
            </p>
          </div>

          {/* Recovery and status */}
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-450">
              <span>Recovery Rate</span>
              <span className="text-rosegold-550">{patientData.recoveryProgress}%</span>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rosegold-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${patientData.recoveryProgress}%` }}
              />
            </div>
            
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium block">
              Estimated Discharge: {new Date(patientData.estimatedDischargeDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Medical & Treatment details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Treatment Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
                <FileText className="w-5 h-5 text-rosegold-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Treatment Log Card</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-650 dark:text-slate-400">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Diagnosed Condition</span>
                  <span className="font-bold text-slate-850 dark:text-white text-sm">{patientData.disease}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Clinical Diagnosis Details</span>
                  <span className="font-medium">{patientData.diagnosis}</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
                <span className="text-[10px] text-slate-400 block uppercase mb-1">Medicines Schedule</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line">
                  {patientData.medicinePlan}
                </p>
              </div>

              <div className="space-y-1 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
                <span className="text-[10px] text-slate-400 block uppercase mb-1">Nutrition & Food Schedule</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line">
                  {patientData.foodPlan}
                </p>
              </div>

              {patientData.specialInstructions && (
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase mb-1">Special Care Instructions</span>
                  <p className="p-3 bg-rosegold-50/50 dark:bg-rosegold-950/10 border border-rosegold-150/10 rounded-xl text-rosegold-750 dark:text-rosegold-300 font-medium leading-relaxed">
                    {patientData.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Timelines & Check-ups */}
            <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
                <Calendar className="w-5 h-5 text-rosegold-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Timelines & Schedules</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-semibold">Admitted On</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    {new Date(patientData.admissionDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="p-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-semibold">Estimated Discharge</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    {new Date(patientData.estimatedDischargeDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-4 bg-rosegold-50/30 dark:bg-rosegold-950/10 border border-rosegold-200/10 rounded-xl space-y-1">
                  <span className="text-[9px] text-rosegold-750 dark:text-rosegold-400 uppercase font-bold">Next Check-Up</span>
                  <span className="text-xs font-extrabold text-rosegold-650 dark:text-rosegold-400 block">
                    {new Date(patientData.nextCheckupDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Clinical staff, Bed telemetry, Billing, Notices */}
          <div className="space-y-6">
            
            {/* Primary Physician Card */}
            <div className="glass-card rounded-2xl p-5 border border-white/20 shadow-sm space-y-4">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Primary Physician</span>
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-rosegold-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md glow-rosegold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{doctorData?.name}</h4>
                  <p className="text-[10px] text-rosegold-600 dark:text-rosegold-400 font-semibold">{doctorData?.specialization}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] text-slate-500 space-y-1 font-medium">
                <p>Email: {doctorData?.email}</p>
                <p>Phone: {doctorData?.phone}</p>
              </div>
            </div>

            {/* Bed Location Telemetry */}
            <div className="glass-card rounded-2xl p-5 border border-white/20 shadow-sm space-y-4">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block">Telemetry Location</span>
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-extrabold text-sm shadow-inner">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Bed ID: {patientData.bedId}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-405 font-medium">{patientData.floor} floor ({patientData.ward})</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold border border-emerald-500/20 inline-block">
                Bed occupancy locked
              </span>
            </div>

            {/* Billing Card */}
            <div className="glass-card rounded-2xl p-5 border border-white/20 shadow-sm space-y-4">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block">Billing & Account Ledger</span>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-850 dark:text-white">Financial Status</span>
                </div>
                
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                  patientData.billingStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  patientData.billingStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {patientData.billingStatus}
                </span>
              </div>
              
              <div className="text-[10px] text-slate-450 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850">
                {patientData.billingStatus === 'Paid' ? (
                  <span>All invoice items have been cleared. Payment receipts have been sent to your registered contact.</span>
                ) : (
                  <span>Please visit the billing desk on the Ground Floor to clear outstanding items prior to discharge.</span>
                )}
              </div>
            </div>

            {/* Hospital Announcements */}
            <div className="glass-card rounded-2xl p-5 border border-white/20 shadow-sm space-y-4">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block">VK Announcements</span>
              
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
                {announcements.length === 0 ? (
                  <span className="text-[10px] text-slate-500 block">No notifications today.</span>
                ) : (
                  announcements.map((ann, index) => (
                    <div key={index} className="p-3 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/40 dark:border-slate-800/40 space-y-1">
                      <h5 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">{ann.title}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-normal">{ann.content}</p>
                      <span className="text-[8px] text-slate-400 block mt-1 font-mono">{new Date(ann.date).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default AttenderDashboard;
