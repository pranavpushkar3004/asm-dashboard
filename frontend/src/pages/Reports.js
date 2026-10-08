import React, { useEffect, useState } from 'react';
import { getExecutiveSummary } from '../services/api';
import { Card, PageHeader, Badge, StatusBadge, LoadingSpinner, Button } from '../components/ui';
import { fmtDate } from '../utils/colors';
import toast from 'react-hot-toast';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExecutiveSummary()
      .then(r => setReport(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ['Title', 'Severity', 'Status', 'CVE', 'CVSS'],
      ...report.top_vulnerabilities.map(v => [v.title, v.severity, v.status, v.cve || '', v.cvss || ''])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `asm-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (!report) return <div className="p-6 text-red-400">Failed to load report.</div>;

  const s = report.summary;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="📊 Reports" subtitle={`Generated ${fmtDate(report.generated_at)} by ${report.generated_by}`}
        action={<Button onClick={exportCSV} variant="secondary" size="sm">📥 Export CSV</Button>} />

      {/* Executive Summary */}
      <Card title="Executive Summary">
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Total Assets', s.total_assets, 'text-cyan-400'],
            ['Open Vulnerabilities', s.open_vulnerabilities, 'text-orange-400'],
            ['Critical Vulnerabilities', s.critical_vulnerabilities, 'text-red-400'],
            ['Open Alerts', s.open_alerts, 'text-yellow-400'],
            ['Expiring Certificates', s.expiring_certificates, 'text-orange-400'],
            ['New Exposed Services', s.new_exposed_services, 'text-yellow-400'],
            ['Approved Domains', s.approved_domains, 'text-green-400'],
          ].map(([k, v, c]) => (
            <div key={k} className="bg-gray-800 rounded-lg p-4 text-center">
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
              <p className="text-xs text-gray-400 mt-1">{k}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Vulnerabilities */}
      <Card title="Top Vulnerabilities">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                {['CVE ID','Title','Severity','CVSS','Status'].map(h => (
                  <th key={h} className="text-left py-2 px-4 text-gray-400 font-semibold uppercase text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.top_vulnerabilities.map(v => (
                <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2 px-4 text-cyan-400 font-mono">{v.cve || `FINDING-${v.id}`}</td>
                  <td className="py-2 px-4 text-gray-200">{v.title}</td>
                  <td className="py-2 px-4"><Badge level={v.severity} /></td>
                  <td className="py-2 px-4"><span className={`font-bold ${Number(v.cvss) >= 9 ? 'text-red-400' : Number(v.cvss) >= 7 ? 'text-orange-400' : 'text-yellow-400'}`}>{v.cvss || '—'}</span></td>
                  <td className="py-2 px-4"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approved Domains */}
      <Card title="Approved Domains">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                {['Domain','Owner','Status'].map(h => <th key={h} className="text-left py-2 px-4 text-gray-400 font-semibold uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {report.approved_domains.map(d => (
                <tr key={d.id} className="border-b border-gray-800">
                  <td className="py-2 px-4 text-cyan-400 font-mono">{d.domain}</td>
                  <td className="py-2 px-4 text-gray-300">{d.owner || '—'}</td>
                  <td className="py-2 px-4"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Changes */}
      <Card title="Recent Attack Surface Changes">
        <div className="divide-y divide-gray-800">
          {report.recent_changes.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Badge level={c.priority} />
              <span className="text-gray-200 text-xs flex-1">{c.description}</span>
              <span className="text-gray-500 text-xs">{fmtDate(c.detected_at)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
