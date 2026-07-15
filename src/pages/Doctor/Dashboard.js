import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  UserPlus,
  Search,
  X,
  Layers,
  Activity,
  Bed,
  FileText,
  TrendingUp
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDetailsPatient, setShowDetailsPatient] = useState(null);
  const [showEditProgressId, setShowEditProgressId] = useState(null);

  // Progress edit range value
  const [progressVal, setProgressVal] = useState(50);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const selectedBedId = watch('bedId');

  const fetchData = async () => {
    try {
      const [patientsRes, bedsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/beds')
      ]);

      // Filter patients assigned to this doctor
      const myPatients = patientsRes.data.filter((p) => p.doctorId === user.id);
      setPatients(myPatients);
      setBeds(bedsRes.data);
    } catch (error) {
      toast.error('Failed to load clinical telemetry');
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync real-time socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('bed_update', (updatedBed) => {
      setBeds((prev) => prev.map((b) => b.id === updatedBed.id ? updatedBed : b));
    });

    socket.on('patient_update', (updatedPatient) => {
      if (updatedPatient.doctorId === user.id) {
        setPatients((prev) => prev.map((p) => p.id === updatedPatient.id ? updatedPatient : p));
      }
    });

    return () => {
      socket.off('bed_update');
      socket.off('patient_update');
    };
  }, [socket, user]);

  // Derived floor and ward when doctor selects a bed
  useEffect(() => {
    if (selectedBedId) {
      const bedObj = beds.find((b) => b.id === selectedBedId);
      if (bedObj) {
        setValue('floor', bedObj.floor);
        setValue('ward', bedObj.ward);
      }
    }
  }, [selectedBedId, beds, setValue]);

  const onAdmitSubmit = async (data) => {
    try {
      // Inject current doctor ID
      data.doctorId = user.id;
      const res = await api.post('/patients', data);

      setPatients((prev) => [res.data, ...prev]);
      setShowAdmitModal(false);
      reset();
      toast.success(`Patient ${data.name} admitted successfully! ID: ${res.data.id}`);
      fetchData(); // Sync bed occupancy states
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admission failed');
    }
  };

  const handleDischarge = async (id) => {
    try {
      await api.post(`/patients/${id}/discharge`);
      toast.success('Patient discharged. Bed released.');
      fetchData();
    } catch (error) {
      toast.error('Failed to discharge patient');
    }
  };

  const handleProgressUpdateSubmit = async () => {
    try {
      await api.put(`/patients/${showEditProgressId}`, { recoveryProgress: Number(progressVal) });
      toast.success('Recovery progress updated');
      setPatients((prev) => prev.map((p) => p.id === showEditProgressId ? { ...p, recoveryProgress: Number(progressVal) } : p));
      setShowEditProgressId(null);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  // Get only available beds for dropdown list
  const availableBeds = beds.filter((b) => b.status === 'Available');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950">
      <Navbar roleTitle="Doctor Hub" />
      <div className="flex">
        <Sidebar role="doctor" />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Physician Dashboard</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage your clinical workload, check bed matrices, and register patient flows.
              </p>
            </div>

            <button
              onClick={() => {
                reset();
                setShowAdmitModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rosegold-500 text-white rounded-xl text-xs font-semibold hover:glow-rosegold hover:bg-rosegold-650 transition-all shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit Patient / Book Bed</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-5 border border-white/20 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Active Cases</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{patients.filter(p => p.status === 'admitted').length} Patients</span>
              </div>
              <div className="p-3 bg-rosegold-100 dark:bg-rosegold-950/20 text-rosegold-500 rounded-xl border border-rosegold-100/10">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 border border-white/20 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Available Beds</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{beds.filter(b => b.status === 'Available').length} Vacant</span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10">
                <Bed className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 border border-white/20 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">VK Hospital Floors</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">8 Active Wards</span>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/10">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center space-x-3 w-full max-w-md bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 px-3 py-2.5 rounded-xl shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, patient name, disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs focus:outline-none dark:text-white"
            />
          </div>

          {/* Patients Listing */}
          <div className="glass-card rounded-2xl border border-white/20 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">My Assigned Patients</h3>

            {filteredPatients.length === 0 ? (
              <div className="text-center py-16 text-slate-450 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-350" />
                <p className="text-xs font-semibold">No active patient records found matching query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((pat) => (
                  <motion.div
                    key={pat.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-rosegold-750 dark:text-rosegold-400 bg-rosegold-50 dark:bg-rosegold-950/20 px-2 py-0.5 rounded border border-rosegold-200/5">
                            {pat.id}
                          </span>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">{pat.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{pat.age} Yrs • {pat.gender}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${pat.status === 'admitted' ? 'bg-rosegold-500/10 text-rosegold-500' : 'bg-slate-500/10 text-slate-500'
                          }`}>
                          {pat.status}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 text-xs text-slate-650 dark:text-slate-450 space-y-1 font-medium">
                        <p className="truncate"><span className="text-slate-400">Diagnosis:</span> {pat.disease}</p>
                        {pat.status === 'admitted' && (
                          <p><span className="text-slate-400">Location:</span> {pat.bedId} ({pat.floor})</p>
                        )}
                        <p><span className="text-slate-400">Billing:</span> {pat.billingStatus}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Recovery progress</span>
                          <span className="text-rosegold-500">{pat.recoveryProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rosegold-500 h-full rounded-full" style={{ width: `${pat.recoveryProgress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <button
                        onClick={() => setShowDetailsPatient(pat)}
                        className="flex-1 py-1.5 bg-slate-105 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Check Card
                      </button>
                      {pat.status === 'admitted' && (
                        <>
                          <button
                            onClick={() => {
                              setShowEditProgressId(pat.id);
                              setProgressVal(pat.recoveryProgress);
                            }}
                            className="p-1.5 border border-rosegold-200 dark:border-rosegold-850 text-rosegold-600 dark:text-rosegold-400 rounded-lg text-xs"
                            title="Update progress"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDischarge(pat.id)}
                            className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/10 hover:bg-indigo-500/20 text-[10px] font-bold rounded-lg transition-colors"
                          >
                            Discharge
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ADMISSION FORM MODAL (Doctor assigns complete patient details) */}
      <AnimatePresence>
        {showAdmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">VK Hospital Bed Booking & Patient Admission Form</h3>
                <button
                  onClick={() => setShowAdmitModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onAdmitSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6">

                {/* 1. Core Demographics */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">1. Demographics & Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient Name</label>
                      <input
                        type="text"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. Kavya Vasanth"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <span className="text-[9px] text-red-500">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Age</label>
                      <input
                        type="number"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. 28"
                        {...register('age', { required: 'Age is required' })}
                      />
                      {errors.age && <span className="text-[9px] text-red-500">{errors.age.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gender</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400 cursor-pointer"
                        {...register('gender', { required: 'Gender is required' })}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <span className="text-[9px] text-red-500">{errors.gender.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Blood Group</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400 cursor-pointer"
                        {...register('bloodGroup', { required: 'Blood Group is required' })}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      {errors.bloodGroup && <span className="text-[9px] text-red-500">{errors.bloodGroup.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Emergency Contact Number</label>
                      <input
                        type="text"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. 9840123456"
                        {...register('emergencyContact', { required: 'Emergency Contact is required' })}
                      />
                      {errors.emergencyContact && <span className="text-[9px] text-red-500">{errors.emergencyContact.message}</span>}
                    </div>
                  </div>
                </div>

                {/* 2. Clinical Info */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">2. Clinical Diagnosis & Allergy Audit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Primary Disease</label>
                      <input
                        type="text"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. Acute Appendicitis"
                        {...register('disease', { required: 'Disease is required' })}
                      />
                      {errors.disease && <span className="text-[9px] text-red-500">{errors.disease.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Known Allergies</label>
                      <input
                        type="text"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. Penicillin, Peanuts (or 'None')"
                        {...register('allergies')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clinical Diagnosis Summary</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                      placeholder="Enter detailed clinical diagnostics findings..."
                      {...register('diagnosis', { required: 'Diagnosis is required' })}
                    />
                    {errors.diagnosis && <span className="text-[9px] text-red-500">{errors.diagnosis.message}</span>}
                  </div>
                </div>

                {/* 3. Bed Management Booking */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">3. Real-Time Bed Assignment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Available Bed Slot</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400 cursor-pointer"
                        {...register('bedId', { required: 'Bed selection is required' })}
                      >
                        <option value="">Choose vacant bed</option>
                        {availableBeds.map((bed) => (
                          <option key={bed.id} value={bed.id}>
                            {bed.bedNumber} - {bed.floor} Floor ({bed.ward})
                          </option>
                        ))}
                      </select>
                      {errors.bedId && <span className="text-[9px] text-red-500">{errors.bedId.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Floor (Auto-filled)</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-500 focus:outline-none"
                        {...register('floor')}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ward (Auto-filled)</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-500 focus:outline-none"
                        {...register('ward')}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Scheduling & Dates */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">4. Schedules & Discharge Planning</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Discharge Date</label>
                      <input
                        type="date"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400 cursor-pointer"
                        {...register('estimatedDischargeDate', { required: 'Discharge date is required' })}
                      />
                      {errors.estimatedDischargeDate && <span className="text-[9px] text-red-500">{errors.estimatedDischargeDate.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Next Check-up Date</label>
                      <input
                        type="date"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400 cursor-pointer"
                        {...register('nextCheckupDate', { required: 'Next check-up date is required' })}
                      />
                      {errors.nextCheckupDate && <span className="text-[9px] text-red-500">{errors.nextCheckupDate.message}</span>}
                    </div>
                  </div>
                </div>

                {/* 5. Treatment details */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">5. Medicine, Food & Special Instructions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Medicine Prescription Plan</label>
                      <textarea
                        rows={2}
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. Paracetamol 650mg TDS, Amoxicillin 500mg BD for 5 days..."
                        {...register('medicinePlan', { required: 'Medicine plan is required' })}
                      />
                      {errors.medicinePlan && <span className="text-[9px] text-red-500">{errors.medicinePlan.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nutrition/Food Schedule</label>
                      <textarea
                        rows={2}
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                        placeholder="e.g. Low sodium liquid diet, soft solid foods in evening..."
                        {...register('foodPlan', { required: 'Food plan is required' })}
                      />
                      {errors.foodPlan && <span className="text-[9px] text-red-500">{errors.foodPlan.message}</span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Special Clinical Instructions</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400"
                      placeholder="e.g. Bed rest, check vitals every 4 hours..."
                      {...register('specialInstructions')}
                    />
                  </div>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAdmitModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-xs text-slate-650 dark:text-slate-350 hover:bg-slate-250 dark:hover:bg-slate-750 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-rosegold-500 hover:bg-rosegold-600 hover:glow-rosegold text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Book Bed & Admit
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: Update Recovery progress */}
      <AnimatePresence>
        {showEditProgressId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Adjust Recovery Progress</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Change the recovery rate estimate for Patient ID {showEditProgressId}.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Current: {progressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rosegold-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditProgressId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-105 dark:bg-slate-800 font-semibold text-xs text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProgressUpdateSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-rosegold-500 hover:bg-rosegold-600 text-white font-semibold text-xs transition-colors"
                >
                  Update Progress
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: Detailed Patient Card (Check Card) */}
      <AnimatePresence>
        {showDetailsPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Clinical Patient Card</h3>
                  <p className="text-xs text-slate-550 dark:text-slate-450">ID: {showDetailsPatient.id} • Registered Registry Details</p>
                </div>
                <button
                  onClick={() => setShowDetailsPatient(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-650 dark:text-slate-350">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Name</span>
                    <span className="font-bold text-slate-850 dark:text-white text-sm">{showDetailsPatient.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Demographics</span>
                    <span className="font-bold text-slate-850 dark:text-white text-sm">{showDetailsPatient.age} Yrs / {showDetailsPatient.gender} ({showDetailsPatient.bloodGroup})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div>
                    <span className="text-[10px] text-slate-450 block uppercase">Admitted Bed</span>
                    <span className="font-bold text-slate-850 dark:text-white">{showDetailsPatient.bedId} ({showDetailsPatient.floor} floor - {showDetailsPatient.ward})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-450 block uppercase">Emergency Contact</span>
                    <span className="font-bold text-slate-850 dark:text-white">{showDetailsPatient.emergencyContact}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div>
                    <span className="text-[10px] text-slate-450 block uppercase">Admitted on</span>
                    <span className="font-bold text-slate-850 dark:text-white">{new Date(showDetailsPatient.admissionDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-450 block uppercase">Estimated Discharge</span>
                    <span className="font-bold text-slate-850 dark:text-white">{new Date(showDetailsPatient.estimatedDischargeDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 block uppercase">Clinical Diagnosis</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-250 font-medium">
                    {showDetailsPatient.diagnosis}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 block uppercase">Medicine Plan</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-250 font-medium">
                    {showDetailsPatient.medicinePlan}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 block uppercase">Food & Nutrition Schedule</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-250 font-medium">
                    {showDetailsPatient.foodPlan}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-450 block uppercase">Allergies</span>
                    <span className="font-bold text-red-500">{showDetailsPatient.allergies}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-450 block uppercase">Next Check-up Date</span>
                    <span className="font-bold text-slate-800 dark:text-white">{new Date(showDetailsPatient.nextCheckupDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {showDetailsPatient.specialInstructions && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-450 block uppercase">Special Instructions</span>
                    <p className="p-3 bg-rosegold-50 dark:bg-rosegold-950/20 border border-rosegold-150/10 rounded-xl text-rosegold-750 dark:text-rosegold-300 font-medium">
                      {showDetailsPatient.specialInstructions}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetailsPatient(null)}
                className="m-6 mt-0 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs hover:bg-slate-850 transition-colors"
              >
                Close Card
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorDashboard;
