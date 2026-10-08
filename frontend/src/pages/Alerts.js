import React, { useEffect, useState, useCallback } from 'react';
import { getAlerts, updateAlert } from '../services/api';
import { Card, PageHeader, Badge, StatusBadge, Table, Pagination, Select, Modal, Button } from '../components/ui';
import { timeAgo, fmtDate } from '../utils/colors';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SEV_OPTS = [{ value: '', label: 'All Severity' }, ...['critical','high','medium','low'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];
const STATUS_OPTS = [{ value: '', label: 'All Status' }, ...['open','acknowledged','resolved','suppressed'].map(v => ({ value: v, label: v }))];

export default function Alerts() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    getAlerts({ page, size: 20, severity: severity || undefined, status: status || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, severity, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [severity, status]);

  const handle = async (id, newStatus) => {
    try {
      await updateAlert(id, { status: newStatus });
      toast.success(`Alert ${newStatus}`);
      setSelected(null);
      load();
    } catch { toast.error('Update failed'); }
  };

  const columns = [
    { key: 'severity', label: 'Sev', render: v => <Badge level={v} /> },
    { key: 'title', label: 'Alert', render: (v, row) => (
      <div>
        <p className="text-gray-100 text-xs font-medium truncate max-w-sm">{v}</p>
        <p className="text-gray-500 text-xs mt-0.5">{row.alert_type?.replace(/_/g,' ')} • {row.domain?.domain || row.asset?.name || '—'}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Created', render: v => <span className="text-gray-500 text-xs">{timeAgo(v)}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="🔔 Alerts" subtitle={`${data.total} total alerts`} />
      <Card>
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-700">
          <Select value={severity} onChange={setSeverity} options={SEV_OPTS} />
          <Select value={status} onChange={setStatus} options={STATUS_OPTS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} onRowClick={setSelected} />
        <Pagination total={data.total} page={page} size={20} onPage={setPage} />
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Alert Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge level={selected.severity} className="text-sm" />
              <StatusBadge status={selected.status} />
              <span className="text-xs text-gray-500">{selected.alert_type?.replace(/_/g,' ')}</span>
            </div>
            <h2 className="text-white font-semibold">{selected.title}</h2>
            {selected.description && <p className="text-gray-400 text-sm">{selected.description}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Asset', selected.asset?.name],
                ['Domain', selected.domain?.domain],
                ['Created', fmtDate(selected.created_at)],
                ['Acknowledged', fmtDate(selected.acknowledged_at)],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-gray-200 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
            {user?.role !== 'viewer' && (
              <div className="flex gap-2 pt-2 border-t border-gray-700">
                {selected.status === 'open' && (
                  <Button onClick={() => handle(selected.id, 'acknowledged')} variant="secondary" size="sm">Acknowledge</Button>
                )}
                {selected.status !== 'resolved' && (
                  <Button onClick={() => handle(selected.id, 'resolved')} size="sm">Resolve</Button>
                )}
                {selected.status !== 'suppressed' && (
                  <Button onClick={() => handle(selected.id, 'suppressed')} variant="ghost" size="sm">Suppress</Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
