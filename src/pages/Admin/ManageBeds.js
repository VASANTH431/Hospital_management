import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { RefreshCw, Bed, Info } from 'lucide-react';

const ManageBeds = () => {
  const socket = useSocket();
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState('All');

  const fetchBeds = async () => {
    try {
      const res = await api.get('/beds');
      setBeds(res.data);
    } catch (error) {
      toast.error('Failed to load beds telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  // Sync WebSocket updates
  useEffect(() => {
    if (!socket) return;

    socket.on('bed_update', (updatedBed) => {
      setBeds((prev) => prev.map((b) => b.id === updatedBed.id ? updatedBed : b));
    });

    return () => {
      socket.off('bed_update');
    };
  }, [socket]);

  const handleStatusChange = async (bedId, newStatus) => {
    try {
      await api.put(`/beds/${bedId}/status`, { status: newStatus });
      toast.success(`Bed ${bedId} updated to ${newStatus}`);
      // In-memory update is handled via WebSocket event or manual fallback
      setBeds((prev) => prev.map((b) => b.id === bedId ? { ...b, status: newStatus, patientId: newStatus === 'Available' ? null : b.patientId } : b));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bed status');
    }
  };

  const floors = ['All', 'Ground', 'First', 'Second', 'Third', 'ICU', 'Emergency', 'VIP', 'General Ward'];

  const filteredBeds = selectedFloor === 'All'
    ? beds
    : beds.filter((b) => b.floor === selectedFloor);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Occupied': return 'bg-rosegold-500/10 text-rosegold-500 border-rosegold-500/20';
      case 'Reserved': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Cleaning': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'Maintenance': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950">
      <Navbar roleTitle="Admin Hub" />
      <div className="flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bed Capacity Control Grid</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit clinical floor grids, modify bed statuses manually, and manage cleaning cycles.</p>
            </div>

            <button
              onClick={fetchBeds}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-rosegold-500 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Bed Grid</span>
            </button>
          </div>

          {/* Floor selection slider */}
          <div className="flex space-x-2 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 p-1.5 rounded-xl overflow-x-auto">
            {floors.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedFloor === floor
                    ? 'bg-rosegold-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-rosegold-500'
                  }`}
              >
                {floor}
              </button>
            ))}
          </div>

          {/* Bed Status Guide */}
          <div className="flex flex-wrap gap-4 items-center bg-white/30 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-xl text-xs text-slate-550 dark:text-slate-400">
            <span className="font-bold flex items-center space-x-1"><Info className="w-4 h-4 text-rosegold-500 mr-1" /> Status Legends:</span>
            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> <span>Available</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rosegold-500" /> <span>Occupied</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-550" /> <span>Reserved</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-550" /> <span>Cleaning</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> <span>Maintenance</span></div>
          </div>

          {/* Bed Grid Display */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="shimmer h-[120px] rounded-xl border" />
              ))}
            </div>
          ) : filteredBeds.length === 0 ? (
            <div className="text-center py-20 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">No Beds Configured</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredBeds.map((bed) => (
                <motion.div
                  key={bed.id}
                  whileHover={{ y: -3 }}
                  className="glass-card rounded-xl p-4 border border-white/20 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1">
                        <Bed className="w-3.5 h-3.5 text-rosegold-550 mr-1" /> {bed.bedNumber}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{bed.floor.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-550 block mt-1 truncate">Ward: {bed.ward}</span>
                  </div>

                  <div className="py-3.5 space-y-1">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold block text-center ${getStatusStyle(bed.status)}`}>
                      {bed.status}
                    </span>
                    {bed.patientId && (
                      <span className="text-[8px] font-bold text-rosegold-650 dark:text-rosegold-400 block text-center truncate mt-1">
                        Pat: {bed.patientId}
                      </span>
                    )}
                  </div>

                  {/* Override controls */}
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-2 flex items-center">
                    <select
                      value={bed.status}
                      disabled={bed.status === 'Occupied'} // Doctors handle Occupied bed via Admissions/Discharges
                      onChange={(e) => handleStatusChange(bed.id, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-semibold p-1 rounded focus:outline-none focus:border-rosegold-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-slate-650 dark:text-slate-350"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied" disabled>Occupied</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageBeds;
