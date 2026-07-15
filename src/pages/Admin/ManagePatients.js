import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Search, Trash2, RefreshCw } from 'lucide-react';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [deletePatientId, setDeletePatientId] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (error) {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDischarge = async (id) => {
    try {
      await api.post(`/patients/${id}/discharge`);
      toast.success('Patient discharged. Bed freed and set to Cleaning.');
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to discharge patient');
    }
  };

  const handleUpdateBilling = async (id, newStatus) => {
    try {
      await api.put(`/patients/${id}`, { billingStatus: newStatus });
      toast.success(`Billing status updated to ${newStatus}`);
      // Update in memory
      setPatients((prev) => prev.map((p) => p.id === id ? { ...p, billingStatus: newStatus } : p));
    } catch (error) {
      toast.error('Failed to update billing status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePatientId) return;
    try {
      await api.delete(`/patients/${deletePatientId}`);
      setPatients((prev) => prev.filter((p) => p.id !== deletePatientId));
      toast.success('Patient record removed');
      setDeletePatientId(null);
    } catch (error) {
      toast.error('Failed to delete patient record');
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.disease.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950">
      <Navbar roleTitle="Admin Hub" />
      <div className="flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Patient Records Directory</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit complete patient records, modify financial billing parameters, and orchestrate discharge workflows.</p>
            </div>

            <button
              onClick={fetchPatients}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-rosegold-500 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-center">
            {/* Search */}
            <div className="flex items-center space-x-3 w-full sm:max-w-xs bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 px-3 py-2.5 rounded-xl shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient ID, name, disease..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs focus:outline-none dark:text-white"
              />
            </div>

            {/* Status select filter */}
            <div className="flex space-x-2 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 p-1.5 rounded-xl">
              {['all', 'admitted', 'discharged'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === filter
                      ? 'bg-rosegold-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-rosegold-500'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="shimmer h-[70px] rounded-xl border" />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-20 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">No Patient Records Found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">There are no patient admissions fitting the criteria.</p>
            </div>
          ) : (
            <div className="bg-white/30 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="p-4 pl-6">Patient ID / Name</th>
                      <th className="p-4">Demographics</th>
                      <th className="p-4">Medical details</th>
                      <th className="p-4">Bed Allocations</th>
                      <th className="p-4">Billing audit</th>
                      <th className="p-4">Recovery</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                    {filteredPatients.map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                        {/* ID / Name */}
                        <td className="p-4 pl-6">
                          <span className="text-[10px] font-bold text-rosegold-650 dark:text-rosegold-400 bg-rosegold-50 dark:bg-rosegold-950/30 px-2 py-0.5 rounded border border-rosegold-200/5">
                            {pat.id}
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white block mt-1.5">{pat.name}</span>
                        </td>

                        {/* Demographics */}
                        <td className="p-4">
                          <span>{pat.age} Yrs / {pat.gender}</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-1">Blood Group: {pat.bloodGroup}</span>
                        </td>

                        {/* Medical details */}
                        <td className="p-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{pat.disease}</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-1 truncate max-w-[150px]">Diag: {pat.diagnosis}</span>
                        </td>

                        {/* Bed Allocations */}
                        <td className="p-4">
                          {pat.status === 'admitted' ? (
                            <>
                              <span className="font-bold text-slate-850 dark:text-slate-200 block">{pat.bedId}</span>
                              <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-1">{pat.floor} floor ({pat.ward})</span>
                            </>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-550 font-semibold italic">Discharged</span>
                          )}
                        </td>

                        {/* Billing status */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${pat.billingStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                pat.billingStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                              {pat.billingStatus}
                            </span>

                            <select
                              value={pat.billingStatus}
                              onChange={(e) => handleUpdateBilling(pat.id, e.target.value)}
                              className="bg-transparent border border-slate-200 dark:border-slate-800 text-[10px] font-semibold py-0.5 rounded text-slate-500 focus:outline-none focus:border-rosegold-400"
                            >
                              <option value="Unpaid">Unpaid</option>
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                        </td>

                        {/* Recovery */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                              <div
                                className="bg-rosegold-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${pat.recoveryProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-rosegold-650 dark:text-rosegold-400">{pat.recoveryProgress}%</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end items-center space-x-2.5">
                            {pat.status === 'admitted' && (
                              <button
                                onClick={() => handleDischarge(pat.id)}
                                className="px-2.5 py-1 text-[10px] font-extrabold border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg transition-all"
                                title="Discharge patient"
                              >
                                Discharge
                              </button>
                            )}

                            <button
                              onClick={() => setDeletePatientId(pat.id)}
                              className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/25 border border-red-500/10 rounded-lg transition-all"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRM DIALOG: Delete Patient */}
      <AnimatePresence>
        {deletePatientId && (
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
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Purge Patient Record?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">You are about to delete patient registry ID {deletePatientId}. If they are currently admitted, their bed allocation will be freed.</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletePatientId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-xs text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-xs hover:bg-red-650 transition-colors"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManagePatients;
