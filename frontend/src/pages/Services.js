import React, { useEffect, useState, useCallback } from 'react';
import { getServices } from '../services/api';
import { Card, PageHeader, Badge, Table, Pagination, Select } from '../components/ui';
import { timeAgo } from '../utils/colors';

const RISK_OPTS = [{ value: '', label: 'All Risk' }, ...['critical','high','medium','low'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];

export default function Services() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [risk, setRisk] = useState('');
  const [isNew, setIsNew] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getServices({ page, size: 20, risk_level: risk || undefined, is_new: isNew === 'true' ? true : isNew === 'false' ? false : undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, risk, isNew]);

  useEffect(() => { load(); }, [load]);

  const HIGH_RISK_PORTS = [21, 23, 3389, 3306, 5432, 27017, 6379];

  const columns = [
    { key: 'ip_address', label: 'IP:Port', render: (v, row) => (
      <div>
        <span className="text-cyan-400 font-mono text-xs">{v}:{row.port}</span>
        <span className="text-gray-500 text-xs ml-2">/{row.protocol}</span>
      </div>
    )},
    { key: 'service_name', label: 'Service', render: (v, row) => (
      <div>
        <p className={`text-xs font-medium ${HIGH_RISK_PORTS.includes(row.port) ? 'text-orange-400' : 'text-gray-200'}`}>{v || '—'}</p>
        <p className="text-gray-500 text-xs">{row.service_version}</p>
      </div>
    )},
    { key: 'risk_level', label: 'Risk', render: v => <Badge level={v} /> },
    { key: 'is_new', label: 'New', render: v => v ? <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">NEW</span> : null },
    { key: 'domain', label: 'Domain', render: v => <span className="text-gray-400 text-xs">{v?.domain || '—'}</span> },
    { key: 'first_seen', label: 'First Seen', render: v => <span className="text-gray-500 text-xs">{timeAgo(v)}</span> },
    { key: 'last_seen', label: 'Last Seen', render: v => <span className="text-gray-500 text-xs">{timeAgo(v)}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="⚡ Exposed Services" subtitle={`${data.total} services discovered`} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-gray-700">
          <Select value={risk} onChange={v => { setRisk(v); setPage(1); }} options={RISK_OPTS} />
          <Select value={isNew} onChange={v => { setIsNew(v); setPage(1); }}
            options={[{ value: '', label: 'All' }, { value: 'true', label: '🆕 New Only' }, { value: 'false', label: 'Known' }]} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={page} size={20} onPage={setPage} />
      </Card>
    </div>
  );
}
