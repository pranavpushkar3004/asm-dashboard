import React from 'react';
import { SEVERITY_COLORS, STATUS_COLORS } from '../../utils/colors';

export function Badge({ level, label, className = '' }) {
  const lvl = level?.toLowerCase();
  const c = SEVERITY_COLORS[lvl];
  if (!c) return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${className}`}>{label || level}</span>;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.badge} ${className}`}>
      {label || level?.toUpperCase()}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const colorClass = STATUS_COLORS[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export function Card({ title, children, className = '', action }) {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, color = 'cyan', onClick }) {
  const colorMap = { cyan: 'text-cyan-400', red: 'text-red-400', orange: 'text-orange-400', green: 'text-green-400', yellow: 'text-yellow-400', blue: 'text-blue-400', purple: 'text-purple-400' };
  return (
    <div
      className={`bg-gray-900 border border-gray-700 rounded-lg p-5 ${onClick ? 'cursor-pointer hover:border-gray-500 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${colorMap[color] || 'text-cyan-400'}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Table({ columns, data, loading, onRowClick, emptyMsg = 'No data found' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/50">
            {columns.map(col => (
              <th key={col.key} className={`text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">{emptyMsg}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i}
              className={`border-b border-gray-800 hover:bg-gray-800/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td key={col.key} className={`py-3 px-4 text-gray-300 ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ total, page, size, onPage }) {
  const totalPages = Math.ceil(total / size);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 text-xs text-gray-400">
      <span>Showing {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}
          className="px-2 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">‹ Prev</button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`px-2 py-1 rounded ${p === page ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>{p}</button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}
          className="px-2 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Next ›</button>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className={`bg-gray-900 border border-gray-700 rounded-xl w-full ${sizeMap[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-64"
      />
    </div>
  );
}

export function Select({ value, onChange, options, className = '' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500 ${className}`}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-gray-800 text-gray-300',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
