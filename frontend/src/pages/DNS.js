import React, { useEffect, useState, useCallback } from 'react';
import { getDNS } from '../services/api';
import { Card, PageHeader, Table, Pagination, SearchInput, Select } from '../components/ui';
import { fmtDate } from '../utils/colors';

const TYPE_OPTS = [{ value: '', label: 'All Types' }, ...['A','AAAA','CNAME','MX','NS','TXT','PTR'].map(v => ({ value: v, label: v }))];

export default function DNS() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [recordType, setRecordType] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getDNS({ page, size: 25, q: q || undefined, record_type: recordType || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q, recordType]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'fqdn', label: 'FQDN', render: v => <span className="text-cyan-400 font-mono text-xs">{v}</span> },
    { key: 'record_type', label: 'Type', render: v => (
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
        v === 'A' ? 'bg-blue-900 text-blue-300' :
        v === 'MX' ? 'bg-purple-900 text-purple-300' :
        v === 'TXT' ? 'bg-yellow-900 text-yellow-300' :
        v === 'CNAME' ? 'bg-cyan-900 text-cyan-300' :
        'bg-gray-700 text-gray-300'
      }`}>{v}</span>
    )},
    { key: 'value', label: 'Value', render: v => <span className="text-gray-300 font-mono text-xs truncate max-w-md block">{v}</span> },
    { key: 'ttl', label: 'TTL', render: v => <span className="text-gray-400 text-xs">{v}s</span> },
    { key: 'is_current', label: 'Current', render: v => (
      <span className={`text-xs ${v ? 'text-green-400' : 'text-gray-500 line-through'}`}>{v ? '✓ Active' : 'Inactive'}</span>
    )},
    { key: 'first_seen', label: 'First Seen', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
    { key: 'last_seen', label: 'Last Seen', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="📋 DNS Records" subtitle={`${data.total} DNS records tracked`} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-gray-700">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1); }} placeholder="Search FQDN or value..." />
          <Select value={recordType} onChange={v => { setRecordType(v); setPage(1); }} options={TYPE_OPTS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={page} size={25} onPage={setPage} />
      </Card>
    </div>
  );
}
