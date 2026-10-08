import React, { useEffect, useState, useCallback } from 'react';
import { getScans, createScan, getDomains } from '../services/api';
import { Card, PageHeader, StatusBadge, Table, Pagination, Modal, Button } from '../components/ui';
import { fmtDate, fmtDateTime } from '../utils/colors';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Scans() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', domain_id: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    getScans({ page: 1, size: 20 })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getDomains({ status: 'approved', size: 100 })
      .then(r => setDomains(r.data.items || []))
      .catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.domain_id) { toast.error('Select an approved domain'); return; }
    setSaving(true);
    try {
      const res = await createScan({ ...form, domain_id: Number(form.domain_id) });
      toast.success(`Scan completed! Found: ${JSON.stringify(res.data.findings)}`);
      setShowCreate(false);
      setForm({ name: '', domain_id: '', notes: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Scan failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'name', label: 'Scan Name', render: v => <span className="text-gray-200 text-xs font-medium">{v}</span> },
    { key: 'scan_type', label: 'Type', render: v => <span className="text-gray-400 text-xs capitalize">{v}</span> },
    { key: 'domain', label: 'Domain', render: v => <span className="text-cyan-400 font-mono text-xs">{v?.domain || '—'}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'started_at', label: 'Started', render: v => <span className="text-gray-400 text-xs">{fmtDateTime(v)}</span> },
    { key: 'completed_at', label: 'Completed', render: v => <span className="text-gray-400 text-xs">{fmtDateTime(v)}</span> },
    { key: 'findings', label: 'Findings', render: v => v ? (
      <div className="text-xs space-x-2">
        {v.new_assets > 0 && <span className="text-cyan-400">{v.new_assets} assets</span>}
        {v.new_services > 0 && <span className="text-yellow-400">{v.new_services} services</span>}
        {v.new_vulnerabilities > 0 && <span className="text-red-400">{v.new_vulnerabilities} vulns</span>}
      </div>
    ) : null },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="🔍 Scan / Import" subtitle="Run simulated discovery on approved assets only"
        action={user?.role !== 'viewer' && <Button onClick={() => setShowCreate(true)}>+ New Scan</Button>} />

      {/* Warning banner */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg px-5 py-3 text-sm">
        <p className="text-blue-300 font-semibold">⚠️ Authorized Scans Only</p>
        <p className="text-blue-400 text-xs mt-1">Scanning is strictly limited to approved assets. Only domains with status "approved" are eligible. All scan activity is audit-logged.</p>
      </div>

      <Card>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={1} size={20} onPage={() => {}} />
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Simulated Scan">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Scan Name</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Q2 Discovery Scan - example-corp.test"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Approved Domain</label>
            <select required value={form.domain_id} onChange={e => setForm(f => ({ ...f, domain_id: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white">
              <option value="">Select domain...</option>
              {domains.map(d => <option key={d.id} value={d.id}>{d.domain} ({d.owner})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="bg-yellow-900/30 border border-yellow-800 rounded p-3 text-xs text-yellow-300">
            This will run a simulated discovery scan and generate realistic demo findings.
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Scanning...' : 'Run Scan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
