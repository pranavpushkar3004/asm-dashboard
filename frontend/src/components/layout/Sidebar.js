import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/',              icon: '⬛', label: 'Dashboard' },
  { to: '/assets',        icon: '🖥️', label: 'Assets' },
  { to: '/domains',       icon: '🌐', label: 'Approved Domains' },
  { to: '/dns',           icon: '📋', label: 'DNS Records' },
  { to: '/certificates',  icon: '🔒', label: 'SSL/TLS Certs' },
  { to: '/services',      icon: '⚡', label: 'Exposed Services' },
  { to: '/vulnerabilities',icon:'⚠️', label: 'Vulnerabilities' },
  { to: '/changes',       icon: '📡', label: 'Surface Changes' },
  { to: '/alerts',        icon: '🔔', label: 'Alerts' },
  { to: '/scans',         icon: '🔍', label: 'Scan / Import' },
  { to: '/reports',       icon: '📊', label: 'Reports' },
  { to: '/audit',         icon: '📜', label: 'Audit Logs' },
  { to: '/settings',      icon: '⚙️', label: 'Users & Settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`flex flex-col bg-gray-900 text-gray-100 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700">
        <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-black font-bold text-sm flex-shrink-0">ASM</div>
        {!collapsed && <span className="font-bold text-sm tracking-wide text-white">Attack Surface Mgr</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-400 hover:text-white text-xs">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-sm mx-1 ${isActive ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <span className="text-base flex-shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-700 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-xs" title="Logout">⏏</button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-gray-400 hover:text-red-400" title="Logout">⏏</button>
        )}
      </div>
    </aside>
  );
}
