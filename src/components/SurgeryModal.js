import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const SurgeryModal = ({ patient, doctorId, onClose, onBook, surgeryToEdit }) => {
    // Format date for datetime-local input
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const { register, handleSubmit } = useForm({
        defaultValues: surgeryToEdit ? {
            ...surgeryToEdit,
            surgeryDate: formatDateTime(surgeryToEdit.surgeryDate)
        } : {}
    });

    const onSubmit = async (data) => {
        try {
            if (surgeryToEdit) {
                const res = await api.put(`/surgeries/${surgeryToEdit.id}`, data);
                toast.success(`Surgery ${data.surgeryName} updated successfully!`);
                onBook(res.data);
            } else {
                const payload = {
                    ...data,
                    patientId: patient.id,
                    doctorId: doctorId,
                };
                const res = await api.post('/surgeries', payload);
                toast.success(`Surgery ${data.surgeryName} booked successfully!`);
                onBook(res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Surgery booking failed');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {surgeryToEdit ? `Edit Surgery: ${surgeryToEdit.surgeryName}` : `Book Surgery for ${patient?.name}`}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Surgery Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs"
                                    placeholder="e.g. Appendectomy"
                                    {...register('surgeryName', { required: 'Required' })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs"
                                    {...register('surgeryDate', { required: 'Required' })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Operation Theater</label>
                                <select
                                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rosegold-400 cursor-pointer"
                                    {...register('operationTheater', { required: 'Required' })}
                                >
                                    <option value="">Choose OT slot</option>
                                    <option value="General OT-1">General OT-1</option>
                                    <option value="General OT-2">General OT-2</option>
                                    <option value="Cardiac Ward OT">Cardiac Ward OT</option>
                                    <option value="Neurology OT">Neurology OT</option>
                                    <option value="Orthopedic OT">Orthopedic OT</option>
                                    <option value="Emergency OT">Emergency OT</option>
                                    <option value="Minor Procedure Room">Minor Procedure Room</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Estimated Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs"
                                    placeholder="e.g. 150000"
                                    {...register('estimatedAmount', { required: 'Required' })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Pre-Surgery Notes</label>
                            <textarea
                                rows={3}
                                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs"
                                placeholder="Any anesthesia or preparation notes..."
                                {...register('notes')}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-xs text-slate-650 dark:text-slate-350 hover:bg-slate-250 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-rosegold-500 hover:bg-rosegold-600 hover:glow-rosegold text-white text-xs font-semibold rounded-xl transition-all">
                            {surgeryToEdit ? 'Save Changes' : 'Schedule Operation'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SurgeryModal;
