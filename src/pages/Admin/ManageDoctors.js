import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Plus, Search, Trash2, Edit, X, Copy, Check, Info } from 'lucide-react';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (error) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const onAddDoctorSubmit = async (data) => {
    try {
      const res = await api.post('/doctors', data);
      setDoctors((prev) => [...prev, res.data]);

      // Store credentials to show Admin
      setGeneratedCreds({
        id: res.data.id,
        password: res.data.generatedPassword,
        name: res.data.name
      });

      setShowAddModal(false);
      reset();
      toast.success(`Registered Dr. ${data.name}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoctorId) return;
    try {
      await api.delete(`/doctors/${deleteDoctorId}`);
      setDoctors((prev) => prev.filter((doc) => doc.id !== deleteDoctorId));
      toast.success('Doctor record deleted successfully');
      setDeleteDoctorId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove doctor');
    }
  };

  const copyToClipboard = () => {
    if (!generatedCreds) return;
    const text = `Doctor Login Credentials:\nName: ${generatedCreds.name}\nDoctor ID: ${generatedCreds.id}\nPassword: ${generatedCreds.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950">
      <Navbar roleTitle="Admin Hub" />
      <div className="flex">
        <Sidebar role="admin" />

        {/* Main Workspace */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Doctor Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Register physicians, modify clinical assignments, and manage medical staff details.</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rosegold-500 text-white rounded-xl text-xs font-semibold hover:glow-rosegold hover:bg-rosegold-600 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Register Doctor</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center space-x-3 w-full max-w-md bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 px-3 py-2.5 rounded-xl shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, specialization, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs focus:outline-none dark:text-white"
            />
          </div>

          {/* Doctors Grid/Table */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="shimmer h-[160px] rounded-2xl border" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-20 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/60">
              <UsersIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-250">No Doctors Registered</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">There are no records matching your query. Click register above to add physicians to VK Hospital.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="glass-card rounded-2xl p-5 border border-white/20 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-rosegold-500 hover:shadow-md transition-all"
                  onClick={() => {
                    setGeneratedCreds({
                      id: doc.id,
                      password: doc.plainPassword || doc.generatedPassword || 'Hidden (Old Record)',
                      name: doc.name
                    });
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="truncate pr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rosegold-650 dark:text-rosegold-400 bg-rosegold-50 dark:bg-rosegold-950/30 px-2 py-0.5 rounded border border-rosegold-200/5">
                          {doc.id}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 truncate">{doc.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{doc.specialization}</p>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-rosegold-100 dark:bg-rosegold-900/40 text-rosegold-750 dark:text-rosegold-300 flex items-center justify-center font-bold text-sm shadow-inner border border-rosegold-100/5">
                        {doc.name.substring(4, 6) || doc.name.substring(0, 2)}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-3 font-medium">
                      <p className="truncate">Email: {doc.email}</p>
                      <p>Phone: {doc.phone}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDoctorId(doc.id);
                      }}
                      className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/25 border border-red-500/10 rounded-lg transition-colors"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Register/Add Doctor */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Physician Registration Form</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onAddDoctorSubmit)} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-rosegold-400 transition-colors"
                    placeholder="e.g. Dr. Kavya Vasanth"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <span className="text-[9px] text-red-500">{errors.name.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-rosegold-400 transition-colors"
                    placeholder="kavya.v@vkhospital.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <span className="text-[9px] text-red-500">{errors.email.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-rosegold-400 transition-colors"
                    placeholder="e.g. 9840123456"
                    {...register('phone', { required: 'Phone is required' })}
                  />
                  {errors.phone && <span className="text-[9px] text-red-500">{errors.phone.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Specialization</label>
                  <input
                    type="text"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-rosegold-400 transition-colors"
                    placeholder="e.g. General Surgery"
                    {...register('specialization', { required: 'Specialization is required' })}
                  />
                  {errors.specialization && <span className="text-[9px] text-red-500">{errors.specialization.message}</span>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-rosegold-500 hover:bg-rosegold-600 hover:glow-rosegold text-white text-xs font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Register Physician</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Generated Credentials Display Card */}
      <AnimatePresence>
        {generatedCreds && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-center space-y-6"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Physician Account Generated</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Provide the credentials below to Dr. {generatedCreds.name.split(' ').pop()} for logging into their Physician Portal.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-left font-mono text-xs space-y-2.5 relative select-all">
                <p><span className="text-slate-450">Login Link:</span> VK Portal</p>
                <p><span className="text-slate-450">Doctor ID:</span> <strong className="text-rosegold-600 dark:text-rosegold-400">{generatedCreds.id}</strong></p>
                <p><span className="text-slate-450">Password:</span> <strong className="text-rosegold-600 dark:text-rosegold-400">{generatedCreds.password}</strong></p>

                <button
                  onClick={copyToClipboard}
                  className="absolute right-3 top-3 p-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg hover:text-rosegold-500 transition-colors"
                  title="Copy credentials"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center space-x-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 p-3.5 rounded-xl text-left text-[10px] leading-relaxed">
                <Info className="w-4 h-4 shrink-0" />
                <span>Copy these details now. For patient security, passwords are stored under one-way cryptographic hashing and will not be displayed again.</span>
              </div>

              <button
                onClick={() => setGeneratedCreds(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-850 text-white font-semibold text-xs hover:bg-slate-850 dark:hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DIALOG: Delete Doctor */}
      <AnimatePresence>
        {deleteDoctorId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Remove Physician Record?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">You are about to delete doctor account {deleteDoctorId} from the database. This action is irreversible.</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteDoctorId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-xs text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-xs hover:bg-red-650 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple Fallback Icon Component to avoid imports
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

export default ManageDoctors;
