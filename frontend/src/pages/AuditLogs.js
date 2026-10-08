import React, { useEffect, useState, useCallback } from 'react';
import { getAuditLogs } from '../services/api';
import { Card, PageHeader, Table, Pagination, SearchInput } from '../components/ui';
import { fmtDateTime } from '../utils/colors';

export default function AuditLogs() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAuditLogs({ page, size: 50, action: q || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const ACTION_COLOR = {
    login: 'text-green-400', create: 'text-cyan-400', update: 'text-yellow-400',
    delete: 'text-red-400', scan_initiated: 'text-purple-400', scan_completed: 'text-purple-400',
    report_generated: 'text-blue-400',
  };

  const columns = [
    { key: 'created_at', label: 'Time', render: v => <span className="text-gray-400 text-xs font-mono">{fmtDateTime(v)}</span> },
    { key: 'user', label: 'User', render: v => <span className="text-cyan-400 text-xs">{v?.username || '—'}</span> },
    { key: 'action', label: 'Action', render: v => <span className={`text-xs font-semibold ${ACTION_COLOR[v] || 'text-gray-300'}`}>{v}</span> },
    { key: 'resource', label: 'Resource', render: v => <span className="text-gray-300 text-xs capitalize">{v || '—'}</span> },
    { key: 'resource_id', label: 'ID', render: v => <span className="text-gray-500 text-xs">{v || '—'}</span> },
    { key: 'details', label: 'Details', render: v => (
      <span className="text-gray-500 font-mono text-xs truncate max-w-xs block">{v ? JSON.stringify(v) : '—'}</span>
    )},
    { key: 'ip_address', label: 'IP', render: v => <span className="text-gray-500 font-mono text-xs">{v || '—'}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="📜 Audit Logs" subtitle={`${data.total} log entries`} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-gray-700">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1); }} placeholder="Filter by action..." />
        </div>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={page} size={50} onPage={setPage} />
      </Card>
    </div>
  );
}
