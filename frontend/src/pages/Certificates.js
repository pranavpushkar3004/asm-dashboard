import React, { useEffect, useState, useCallback } from 'react';
import { getCertificates } from '../services/api';
import { Card, PageHeader, StatusBadge, Table, Pagination, Select } from '../components/ui';
import { fmtDate } from '../utils/colors';

const STATUS_OPTS = [{ value: '', label: 'All' }, ...['valid','expiring','expired'].map(v => ({ value: v, label: v }))];

export default function Certificates() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getCertificates({ page, size: 20, status: status || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const daysColor = (d) => {
    if (d < 0) return 'text-red-400';
    if (d <= 14) return 'text-red-400';
    if (d <= 30) return 'text-orange-400';
    return 'text-green-400';
  };

  const columns = [
    { key: 'common_name', label: 'Common Name', render: (v, row) => (
      <div>
        <p className="text-cyan-400 font-mono text-xs">{v}</p>
        <p className="text-gray-500 text-xs">{row.issuer_org}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'days_remaining', label: 'Expires', render: (v, row) => (
      <div>
        <span className={`text-sm font-bold ${daysColor(v)}`}>{v < 0 ? 'EXPIRED' : `${v}d`}</span>
        <p className="text-gray-500 text-xs">{fmtDate(row.valid_to)}</p>
      </div>
    )},
    { key: 'issuer', label: 'Issuer', render: v => <span className="text-gray-400 text-xs truncate max-w-xs">{v}</span> },
    { key: 'key_algorithm', label: 'Key', render: (v, row) => <span className="text-gray-400 text-xs">{v} {row.key_size}</span> },
    { key: 'signature_algo', label: 'Sig Algo', render: v => (
      <span className={`text-xs ${v?.includes('SHA1') ? 'text-red-400' : 'text-gray-400'}`}>{v}</span>
    )},
    { key: 'sans', label: 'SANs', render: v => <span className="text-gray-500 text-xs">{v?.length || 0} entries</span> },
    { key: 'valid_from', label: 'Valid From', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="🔒 SSL/TLS Certificates" subtitle={`${data.total} certificates tracked`} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-gray-700">
          <Select value={status} onChange={setStatus} options={STATUS_OPTS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} />
        <Pagination total={data.total} page={page} size={20} onPage={setPage} />
      </Card>
    </div>
  );
}
