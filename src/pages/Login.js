import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Heart, Shield, Stethoscope, User, Lock, Key } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Set default active tab role from URL query param, default to attender
  const initialRole = searchParams.get('role') || 'attender';
  const [activeRole, setActiveRole] = useState(initialRole);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'attender') navigate('/attender/dashboard');
    }
  }, [user, navigate]);

  // Sync tab state when URL parameters change
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['admin', 'doctor', 'attender'].includes(roleParam)) {
      setActiveRole(roleParam);
      reset();
    }
  }, [searchParams, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    let credentials = {};

    if (activeRole === 'admin') {
      credentials = { username: data.username, password: data.password, role: 'admin' };
    } else if (activeRole === 'doctor') {
      credentials = { username: data.doctorId, password: data.password, role: 'doctor' };
    } else {
      credentials = { patientId: data.patientId, role: 'attender' };
    }

    const result = await login(credentials);
    setSubmitting(false);

    if (result.success) {
      toast.success('Successfully authenticated!');
      // Redirection is handled in the user useEffect hook
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleLogin = () => {
    if (activeRole === 'admin') {
      // Simulate Google Login for authorized Admin accounts
      toast.loading('Contacting Google Accounts...', { id: 'google_load' });
      setTimeout(() => {
        toast.dismiss('google_load');
        // Let's log in as one of the admins for validation purposes
        login({ username: 'vasanthadmin123', password: 'vasanthadmin123', role: 'admin' })
          .then((res) => {
            if (res.success) {
              toast.success('Google Login Authorized: Welcome back Admin Vasanth!');
            } else {
              toast.error('Google Account not authorized for Admin access');
            }
          });
      }, 1500);
    } else {
      toast.error('Google OAuth only allowed for Hospital Administrators.');
    }
  };

  const roles = [
    { id: 'attender', label: 'Patient Attender', icon: <User className="w-4 h-4" /> },
    { id: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slatebg-50 dark:bg-slatebg-950 flex flex-col items-center justify-center p-4 particle-grid relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-rosegold-100/30 dark:bg-rosegold-900/10 filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-rosegold-200/20 dark:bg-rosegold-950/10 filter blur-[80px] pointer-events-none" />

      {/* Hospital Logo & Header */}
      <div className="flex items-center space-x-3 mb-8 cursor-pointer z-10" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-xl bg-rosegold-500 flex items-center justify-center glow-rosegold">
          <Heart className="w-5 h-5 text-white animate-heartbeat" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          VK <span className="text-rosegold-500">Hospital</span>
        </span>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card rounded-2xl border border-white/20 shadow-xl overflow-hidden z-10"
      >
        {/* Role Select Tabs */}
        <div className="flex border-b border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRole(r.id);
                reset();
              }}
              className={`flex-1 py-4 flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeRole === r.id
                ? 'border-b-2 border-rosegold-500 text-rosegold-600 dark:text-rosegold-400 bg-white/50 dark:bg-slate-900/40'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
                }`}
            >
              {r.icon}
              <span className="hidden sm:inline">{r.label}</span>
              <span className="inline sm:hidden">{r.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeRole === 'admin' && 'Administrator Portal'}
              {activeRole === 'doctor' && 'Medical Doctor Access'}
              {activeRole === 'attender' && 'Patient Attender Sign-in'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeRole === 'admin' && 'Sign in using system admin credentials.'}
              {activeRole === 'doctor' && 'Enter your generated Doctor ID and credentials.'}
              {activeRole === 'attender' && 'Enter the 5-digit Patient ID located on the medical ticket.'}
            </p>
          </div>

          {/* Form Inputs based on selected role */}
          <div className="space-y-4">
            {activeRole === 'admin' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rosegold-400 transition-colors"
                      placeholder="Username"
                      {...register('username', { required: 'Username is required' })}
                    />
                  </div>
                  {errors.username && <span className="text-[10px] text-red-500">{errors.username.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rosegold-400 transition-colors"
                      placeholder="••••••••"
                      {...register('password', { required: 'Password is required' })}
                    />
                  </div>
                  {errors.password && <span className="text-[10px] text-red-500">{errors.password.message}</span>}
                </div>
              </>
            )}

            {activeRole === 'doctor' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Doctor ID</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rosegold-400 transition-colors"
                      placeholder="e.g. DOC101"
                      {...register('doctorId', { required: 'Doctor ID is required' })}
                    />
                  </div>
                  {errors.doctorId && <span className="text-[10px] text-red-500">{errors.doctorId.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rosegold-400 transition-colors"
                      placeholder="••••••••"
                      {...register('password', { required: 'Password is required' })}
                    />
                  </div>
                  {errors.password && <span className="text-[10px] text-red-500">{errors.password.message}</span>}
                </div>
              </>
            )}

            {activeRole === 'attender' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rosegold-400 transition-colors"
                    placeholder="e.g. PAT49204"
                    {...register('patientId', { required: 'Patient ID is required' })}
                  />
                </div>
                {errors.patientId && <span className="text-[10px] text-red-500">{errors.patientId.message}</span>}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rosegold-500 to-rosegold-650 text-white font-semibold text-sm hover:glow-rosegold hover:from-rosegold-600 hover:to-rosegold-700 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Admin Google Sign-in option */}
          {activeRole === 'admin' && (
            <div className="space-y-4 mt-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 w-full border-t border-slate-200/50 dark:border-slate-800/40" />
                <span className="relative px-3 bg-slatebg-50 dark:bg-slatebg-950 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Or authorized identity
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all text-xs font-semibold flex items-center justify-center space-x-2.5 text-slate-600 dark:text-slate-350"
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
