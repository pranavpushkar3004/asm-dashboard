import React, { useEffect, useState, useCallback } from 'react';
import { getDomains, createDomain, updateDomain } from '../services/api';
import { Card, PageHeader, StatusBadge, Table, Pagination, SearchInput, Select, Modal, Button } from '../components/ui';
import { fmtDate } from '../utils/colors';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTS = [{ value: '', label: 'All Status' }, ...['approved','pending','revoked','expired'].map(v => ({ value: v, label: v }))];

export default function Domains() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ domain: '', owner: '', status: 'approved', notes: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    getDomains({ page, size: 20, q: q || undefined, status: status || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q, status]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDomain(form);
      toast.success('Domain added');
      setShowAdd(false);
      setForm({ domain: '', owner: '', status: 'approved', notes: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id) => {
    try {
      await updateDomain(id, { status: 'approved' });
      toast.success('Domain approved');
      load();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'domain', label: 'Domain', render: (v) => <span className="text-cyan-400 font-mono text-xs">{v}</span> },
    { key: 'owner', label: 'Owner', render: v => <span className="text-gray-300 text-xs">{v || '—'}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'approval_date', label: 'Approved', render: v => <span className="text-gray-400 text-xs">{fmtDate(v)}</span> },
    { key: 'review_date', label: 'Review Date', render: v => <span className="text-gray-400 text-xs">{fmtDate(v)}</span> },
    { key: 'notes', label: 'Notes', render: v => <span className="text-gray-500 text-xs truncate max-w-xs">{v || '—'}</span> },
    { key: 'id', label: '', render: (v, row) => row.status === 'pending' && user?.role !== 'viewer' ? (
      <button onClick={() => handleApprove(v)} className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded hover:bg-gray-800">Approve</button>
    ) : null },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="🌐 Approved Domains" subtitle="Only approved domains can be scanned"
        action={user?.role !== 'viewer' && <Button onClick={() => setShowAdd(true)}>+ Add Domain</Button>} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-gray-700">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1); }} placeholder="Search domains..." />
          <Select value={status} onChange={setStatus} options={STATUS_OPTS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={page} size={20} onPage={setPage} />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Approved Domain">
        <form onSubmit={handleAdd} className="space-y-4">
          {[['domain','Domain (e.g. example-corp.test)','text',true],['owner','Owner / Team','text',false]].map(([k, p, t, req]) => (
            <div key={k}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{k}</label>
              <input type={t} required={req} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                placeholder={p} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white">
              {['approved','pending'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAdd(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Domain'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
