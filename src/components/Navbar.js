import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Heart, Bell } from 'lucide-react';

const Navbar = ({ roleTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('vk_theme') === 'dark' || 
      (!localStorage.getItem('vk_theme') && window.matchMedia('(pre-matches-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('vk_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('vk_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b transition-all duration-300">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 rounded-xl bg-rosegold-500 flex items-center justify-center glow-rosegold">
          <Heart className="w-5 h-5 text-white animate-heartbeat" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            VK <span className="text-rosegold-500">Hospital</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-1">
            {roleTitle || 'Flow Hub'}
          </span>
        </div>
      </div>

      {/* Center Announcements Badge or Notifications indicator */}
      <div className="hidden md:flex items-center space-x-2 bg-rosegold-50 dark:bg-rosegold-950/20 border border-rosegold-100/20 px-3.5 py-1.5 rounded-full text-xs text-rosegold-750 dark:text-rosegold-300">
        <span className="w-2 h-2 rounded-full bg-rosegold-400 animate-pulse" />
        <span className="font-semibold">VK Live Sync Connected</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-rosegold-500 transition-colors"
          title="Toggle Light/Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Card */}
        {user && (
          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-250 dark:border-slate-800">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                {user.name || user.username}
              </span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 capitalize font-medium mt-1">
                {user.role} {user.specialization ? `• ${user.specialization}` : ''}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rosegold-200 dark:bg-rosegold-900/50 text-rosegold-700 dark:text-rosegold-300 flex items-center justify-center font-bold text-xs uppercase shadow-inner border border-rosegold-100/10">
              {(user.name || user.username).substring(0, 2)}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-red-500/10 dark:bg-red-500/5 hover:bg-red-500/25 border border-red-500/10 text-red-500 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
