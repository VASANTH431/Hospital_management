import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const EditPatientModal = ({ patient, onClose, onUpdate, beds }) => {
    const { register, handleSubmit, setValue, watch } = useForm();

    useEffect(() => {
        if (patient) {
            // Pre-fill form
            const fields = ['name', 'age', 'gender', 'disease', 'diagnosis', 'bloodGroup',
                'foodPlan', 'medicinePlan', 'allergies', 'emergencyContact',
                'specialInstructions', 'bedId', 'billingStatus'];
            fields.forEach(field => setValue(field, patient[field] || ''));
            setValue('estimatedDischargeDate', patient.estimatedDischargeDate ? new Date(patient.estimatedDischargeDate).toISOString().split('T')[0] : '');
            setValue('nextCheckupDate', patient.nextCheckupDate ? new Date(patient.nextCheckupDate).toISOString().split('T')[0] : '');
        }
    }, [patient, setValue]);

    const selectedBedId = watch('bedId');

    useEffect(() => {
        if (selectedBedId && beds) {
            const bedObj = beds.find((b) => b.id === selectedBedId);
            if (bedObj) {
                setValue('floor', bedObj.floor);
                setValue('ward', bedObj.ward);
            }
        }
    }, [selectedBedId, beds, setValue]);

    const onSubmit = async (data) => {
        try {
            const res = await api.put(`/patients/${patient.id}`, data);
            toast.success(`Patient ${data.name} updated successfully!`);
            // Use the updated patient response
            onUpdate(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const availableBeds = beds.filter((b) => b.status === 'Available' || b.id === patient.bedId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slatebg-950/70 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Patient Details: {patient?.name}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* 1. Demographics */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">Demographics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Name</label>
                                <input type="text" className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('name')} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Age</label>
                                <input type="number" className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('age')} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                        <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">Diagnosis & Bed</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Disease</label>
                                <input type="text" className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('disease')} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Bed (Select to change)</label>
                                <select className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('bedId')}>
                                    {availableBeds.map(b => (
                                        <option key={b.id} value={b.id}>{b.bedNumber} ({b.floor} - {b.ward})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1 col-span-1 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-500">Diagnosis</label>
                                <textarea rows={2} className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('diagnosis')} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                        <h4 className="text-xs font-bold text-rosegold-650 uppercase tracking-wide">Treatment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Medicine Plan</label>
                                <textarea rows={2} className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('medicinePlan')} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Food Plan</label>
                                <textarea rows={2} className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('foodPlan')} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Billing Status</label>
                                <select className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs" {...register('billingStatus')}>
                                    <option value="Paid">Paid</option>
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-xs text-slate-650 dark:text-slate-350 hover:bg-slate-250 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-rosegold-500 hover:bg-rosegold-600 hover:glow-rosegold text-white text-xs font-semibold rounded-xl transition-all">
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditPatientModal;
