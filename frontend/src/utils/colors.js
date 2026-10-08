// Colour helpers for risk/severity/status levels

export const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500', badge: 'bg-red-600 text-white' },
  high:     { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500', badge: 'bg-orange-500 text-white' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500', badge: 'bg-yellow-500 text-white' },
  low:      { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500', badge: 'bg-green-600 text-white' },
  info:     { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500', badge: 'bg-blue-600 text-white' },
};

export const STATUS_COLORS = {
  open:          'bg-red-100 text-red-800',
  acknowledged:  'bg-yellow-100 text-yellow-800',
  in_progress:   'bg-blue-100 text-blue-800',
  resolved:      'bg-green-100 text-green-800',
  closed:        'bg-gray-100 text-gray-700',
  false_positive:'bg-purple-100 text-purple-800',
  accepted:      'bg-indigo-100 text-indigo-800',
  suppressed:    'bg-gray-100 text-gray-600',
  active:        'bg-green-100 text-green-800',
  inactive:      'bg-gray-100 text-gray-600',
  approved:      'bg-green-100 text-green-800',
  pending:       'bg-yellow-100 text-yellow-800',
  revoked:       'bg-red-100 text-red-800',
  expired:       'bg-red-100 text-red-800',
  valid:         'bg-green-100 text-green-800',
  expiring:      'bg-orange-100 text-orange-800',
};

export const CHANGE_TYPE_ICONS = {
  new_domain:       '🌐',
  new_subdomain:    '🔗',
  new_ip:           '📍',
  new_service:      '⚡',
  dns_change:       '📋',
  cert_change:      '🔒',
  new_vulnerability:'⚠️',
  removed_asset:    '🗑️',
  risk_change:      '📊',
  status_change:    '🔄',
};

export function severityBadge(level) {
  const s = level?.toLowerCase();
  return SEVERITY_COLORS[s] || SEVERITY_COLORS.info;
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
