import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getDashboardStats } from '../services/api';
import { StatCard, Card, Badge, StatusBadge, PageHeader, LoadingSpinner } from '../components/ui';
import { timeAgo, fmtDate, CHANGE_TYPE_ICONS, SEVERITY_COLORS } from '../utils/colors';

const COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', info: '#3b82f6' };
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (!stats) return <div className="p-6 text-red-400">Failed to load dashboard.</div>;

  const severityData = Object.entries(stats.vuln_by_severity).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: COLORS[name] }));
  const riskData = Object.entries(stats.risk_distribution).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: COLORS[name] }));
  const assetData = Object.entries(stats.asset_by_type).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="🛡️ Attack Surface Dashboard" subtitle="Real-time overview of your external attack surface" />

      {/* Critical Banner */}
      {stats.critical_alerts > 0 && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-5 py-3 flex items-center gap-3">
          <span className="text-red-400 text-xl">🚨</span>
          <div>
            <p className="text-red-300 font-semibold text-sm">{stats.critical_alerts} CRITICAL alert{stats.critical_alerts > 1 ? 's' : ''} require immediate attention</p>
            <p className="text-red-400 text-xs">{stats.critical_vulns} critical vulnerabilities unresolved • {stats.expiring_certs} certificates expiring soon</p>
          </div>
          <button onClick={() => navigate('/alerts')} className="ml-auto text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg">View Alerts →</button>
        </div>
      )}

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon="🖥️" label="Total Assets" value={stats.total_assets} color="cyan" onClick={() => navigate('/assets')} />
        <StatCard icon="🌐" label="Domains" value={stats.total_domains + stats.total_subdomains} sub={`${stats.total_domains} domains, ${stats.total_subdomains} subdomains`} color="blue" onClick={() => navigate('/domains')} />
        <StatCard icon="📍" label="IP Addresses" value={stats.total_ips} color="purple" onClick={() => navigate('/assets')} />
        <StatCard icon="⚡" label="Services" value={stats.total_services} color="yellow" onClick={() => navigate('/services')} />
        <StatCard icon="🔒" label="Certificates" value={stats.total_certificates} sub={`${stats.expiring_certs} expiring`} color={stats.expiring_certs > 0 ? 'orange' : 'green'} onClick={() => navigate('/certificates')} />
        <StatCard icon="🆕" label="New Assets 7d" value={stats.new_assets_7d} color="cyan" />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="⚠️" label="Open Vulns" value={stats.total_vulnerabilities} color={stats.total_vulnerabilities > 0 ? 'red' : 'green'} onClick={() => navigate('/vulnerabilities')} />
        <StatCard icon="🔴" label="Critical Vulns" value={stats.critical_vulns} color="red" onClick={() => navigate('/vulnerabilities?severity=critical')} />
        <StatCard icon="🔔" label="Open Alerts" value={stats.open_alerts} color={stats.open_alerts > 0 ? 'orange' : 'green'} onClick={() => navigate('/alerts')} />
        <StatCard icon="🚨" label="Critical Alerts" value={stats.critical_alerts} color="red" onClick={() => navigate('/alerts?severity=critical')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vuln by Severity */}
        <Card title="Vulnerabilities by Severity">
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Count">
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card title="Asset Risk Distribution">
          <div className="p-4 h-52 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="45%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false} fontSize={11}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Asset Types */}
        <Card title="Asset Type Distribution">
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Changes */}
        <Card title="Recent Surface Changes" action={<button onClick={() => navigate('/changes')} className="text-xs text-cyan-400 hover:text-cyan-300">View all →</button>}>
          <div className="divide-y divide-gray-800">
            {stats.recent_changes?.length === 0 && <p className="p-4 text-gray-500 text-sm">No recent changes</p>}
            {stats.recent_changes?.map(c => (
              <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                <span className="text-lg mt-0.5">{CHANGE_TYPE_ICONS[c.change_type] || '🔄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 truncate">{c.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{timeAgo(c.detected_at)}</p>
                </div>
                <Badge level={c.priority} />
              </div>
            ))}
          </div>
        </Card>

        {/* Top Alerts */}
        <Card title="Active Alerts" action={<button onClick={() => navigate('/alerts')} className="text-xs text-cyan-400 hover:text-cyan-300">View all →</button>}>
          <div className="divide-y divide-gray-800">
            {stats.top_alerts?.length === 0 && <p className="p-4 text-gray-500 text-sm">No active alerts</p>}
            {stats.top_alerts?.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/40" onClick={() => navigate('/alerts')}>
                <Badge level={a.severity} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{timeAgo(a.created_at)}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
