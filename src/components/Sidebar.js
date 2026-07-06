import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Bed, Activity, Megaphone, Stethoscope, UserCog } from 'lucide-react';

const Sidebar = ({ role }) => {
  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: <Stethoscope className="w-5 h-5" /> },
    { name: 'Manage Patients', path: '/admin/patients', icon: <Users className="w-5 h-5" /> },
    { name: 'Manage Beds', path: '/admin/beds', icon: <Bed className="w-5 h-5" /> }
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Profile Settings', path: '/doctor/profile', icon: <UserCog className="w-5 h-5" /> }
  ];

  const links = role === 'admin' ? adminLinks : doctorLinks;

  return (
    <aside className="w-64 border-r border-slate-200/50 dark:border-slate-800/40 min-h-[calc(100vh-73px)] p-6 bg-white/30 dark:bg-slate-950/20 backdrop-blur-md flex flex-col justify-between hidden md:flex">
      <div className="space-y-8">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-3">
            Main Menu
          </span>
          <nav className="space-y-1.5 mt-2">
            {links.map((link, idx) => (
              <NavLink
                key={idx}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-rosegold-500 text-white shadow-md glow-rosegold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-rosegold-500 hover:bg-rosegold-50/50 dark:hover:bg-rosegold-950/10'
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Decorative Brand Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-rosegold-100 to-rosegold-200/40 dark:from-rosegold-950/20 dark:to-rosegold-900/10 border border-rosegold-150/10 text-center">
        <h4 className="text-xs font-bold text-rosegold-750 dark:text-rosegold-300">VK Bed Orchestrator</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Dynamic patient routing & real-time telemetry grid.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
