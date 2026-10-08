import React, { useEffect, useState, useCallback } from 'react';
import { getVulnerabilities, updateVulnerability } from '../services/api';
import { Card, PageHeader, Badge, StatusBadge, Table, Pagination, SearchInput, Select, Modal, Button } from '../components/ui';
import { fmtDate, fmtDateTime } from '../utils/colors';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SEV_OPTS = [{ value: '', label: 'All Severity' }, ...['critical','high','medium','low','info'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];
const STATUS_OPTS = [{ value: '', label: 'All Status' }, ...['open','in_progress','resolved','accepted','false_positive'].map(v => ({ value: v, label: v.replace(/_/g,' ') }))];

export default function Vulnerabilities() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updStatus, setUpdStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    getVulnerabilities({ page, size: 20, q: q || undefined, severity: severity || undefined, status: status || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q, severity, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, severity, status]);

  const handleUpdateStatus = async () => {
    if (!updStatus || !selected) return;
    setSaving(true);
    try {
      await updateVulnerability(selected.id, { status: updStatus });
      toast.success('Status updated');
      setSelected(null);
      load();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'cve_id', label: 'CVE / ID', render: (v, row) => (
      <div>
        <p className="text-cyan-400 text-xs font-mono">{v || `FINDING-${row.id}`}</p>
        <p className="text-gray-400 text-xs truncate max-w-xs">{row.title}</p>
      </div>
    )},
    { key: 'severity', label: 'Severity', render: v => <Badge level={v} /> },
    { key: 'cvss_score', label: 'CVSS', render: v => (
      <span className={`text-xs font-bold ${Number(v) >= 9 ? 'text-red-400' : Number(v) >= 7 ? 'text-orange-400' : Number(v) >= 4 ? 'text-yellow-400' : 'text-green-400'}`}>
        {v ? Number(v).toFixed(1) : '—'}
      </span>
    )},
    { key: 'asset', label: 'Asset', render: (v, row) => <span className="text-gray-400 text-xs">{v?.name || '—'}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'owner', label: 'Owner', render: v => <span className="text-gray-400 text-xs">{v || '—'}</span> },
    { key: 'detected_at', label: 'Detected', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="⚠️ Vulnerabilities" subtitle={`${data.total} findings`} />

      <Card>
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-700">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1); }} placeholder="Search CVE, title..." />
          <Select value={severity} onChange={setSeverity} options={SEV_OPTS} />
          <Select value={status} onChange={setStatus} options={STATUS_OPTS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} onRowClick={row => { setSelected(row); setUpdStatus(row.status); }} />
        <Pagination total={data.total} page={page} size={20} onPage={setPage} />
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Vulnerability Details" size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge level={selected.severity} className="text-sm mt-0.5" />
              {selected.cve_id && <span className="text-cyan-400 font-mono text-sm">{selected.cve_id}</span>}
              {selected.cvss_score && <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">CVSS {Number(selected.cvss_score).toFixed(1)}</span>}
            </div>
            <h2 className="text-white font-semibold text-base">{selected.title}</h2>
            {selected.description && <p className="text-gray-400 text-sm leading-relaxed">{selected.description}</p>}
            {selected.cvss_vector && (
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">CVSS Vector</p>
                <p className="text-xs font-mono text-cyan-300">{selected.cvss_vector}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Asset', selected.asset?.name],
                ['Owner', selected.owner],
                ['Detected', fmtDate(selected.detected_at)],
                ['Resolved', fmtDate(selected.resolved_at)],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-gray-200 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
            {selected.remediation && (
              <div className="bg-green-900/20 border border-green-800 rounded p-4">
                <p className="text-xs text-green-400 font-semibold mb-1">Remediation</p>
                <p className="text-sm text-green-200">{selected.remediation}</p>
              </div>
            )}
            {user?.role !== 'viewer' && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-700">
                <Select value={updStatus} onChange={setUpdStatus} options={STATUS_OPTS.slice(1)} className="flex-1" />
                <Button onClick={handleUpdateStatus} disabled={saving}>{saving ? 'Saving...' : 'Update Status'}</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
