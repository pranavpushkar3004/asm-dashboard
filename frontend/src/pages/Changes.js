import React, { useEffect, useState, useCallback } from 'react';
import { getChanges } from '../services/api';
import { Card, PageHeader, Badge, Table, Pagination, Select } from '../components/ui';
import { timeAgo, CHANGE_TYPE_ICONS } from '../utils/colors';

const PRIORITY_OPTS = [{ value: '', label: 'All Priority' }, ...['critical','high','medium','low'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];
const TYPE_OPTS = [
  { value: '', label: 'All Types' },
  ...['new_domain','new_subdomain','new_ip','new_service','dns_change','cert_change','new_vulnerability','removed_asset','risk_change','status_change']
    .map(v => ({ value: v, label: v.replace(/_/g, ' ') }))
];

export default function Changes() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [priority, setPriority] = useState('');
  const [changeType, setChangeType] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getChanges({ page, size: 25, priority: priority || undefined, change_type: changeType || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, priority, changeType]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'change_type', label: 'Type', render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className="text-lg">{CHANGE_TYPE_ICONS[v] || '🔄'}</span>
        <span className="text-xs text-gray-300 capitalize">{v?.replace(/_/g, ' ')}</span>
      </div>
    )},
    { key: 'description', label: 'Description', render: v => <span className="text-gray-200 text-xs">{v}</span> },
    { key: 'previous_val', label: 'Previous', render: v => <span className="text-red-400 font-mono text-xs">{v || '—'}</span> },
    { key: 'new_val', label: 'New', render: v => <span className="text-green-400 font-mono text-xs">{v || '—'}</span> },
    { key: 'priority', label: 'Priority', render: v => <Badge level={v} /> },
    { key: 'asset', label: 'Asset', render: v => <span className="text-gray-500 text-xs">{v?.name || '—'}</span> },
    { key: 'detected_at', label: 'Detected', render: v => <span className="text-gray-500 text-xs">{timeAgo(v)}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="📡 Attack Surface Changes" subtitle={`${data.total} changes recorded`} />
      <Card>
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-700">
          <Select value={changeType} onChange={v => { setChangeType(v); setPage(1); }} options={TYPE_OPTS} />
          <Select value={priority} onChange={v => { setPriority(v); setPage(1); }} options={PRIORITY_OPTS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={page} size={25} onPage={setPage} />
      </Card>
    </div>
  );
}
