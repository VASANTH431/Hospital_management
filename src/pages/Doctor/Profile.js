import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Lock, Mail, Phone, User, Key, Save } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // If password field is empty, delete it from payload
      if (!data.password) {
        delete data.password;
      }
      const res = await api.put(`/doctors/${user.id}`, data);
      
      // Update local context state
      setUser({ ...user, ...res.data });
      
      reset({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        password: ''
      });
      toast.success('Clinical Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950">
      <Navbar roleTitle="Doctor Hub" />
      <div className="flex">
        <Sidebar role="doctor" />
        
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)] flex justify-center items-start">
          <div className="w-full max-w-xl glass-card rounded-2xl border border-white/20 p-8 shadow-md">
            
            <div className="border-b border-slate-200/50 dark:border-slate-800/40 pb-5 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-rosegold-500 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md glow-rosegold">
                {user?.name.substring(4, 6) || user?.name.substring(0, 2)}
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{user?.specialization} Specialist • VK Hospital</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-xs text-slate-650 dark:text-slate-350">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Doctor Registry ID</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-450" />
                    <input
                      type="text"
                      readOnly
                      value={user?.id}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 pl-10 pr-4 text-slate-500 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Clinical Specialty</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-450" />
                    <input
                      type="text"
                      readOnly
                      value={user?.specialization}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 pl-10 pr-4 text-slate-500 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Full Physician Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rosegold-400"
                    placeholder="e.g. Dr. Kavya Vasanth"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && <span className="text-[9px] text-red-500">{errors.name.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rosegold-400"
                    placeholder="kavya@vkhospital.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <span className="text-[9px] text-red-500">{errors.email.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rosegold-400"
                    placeholder="e.g. 9840123456"
                    {...register('phone', { required: 'Phone is required' })}
                  />
                </div>
                {errors.phone && <span className="text-[9px] text-red-500">{errors.phone.message}</span>}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Update Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rosegold-400"
                    placeholder="Leave empty to keep existing password"
                    {...register('password')}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-rosegold-500 hover:bg-rosegold-600 hover:glow-rosegold text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving Changes...' : 'Save Settings'}</span>
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
