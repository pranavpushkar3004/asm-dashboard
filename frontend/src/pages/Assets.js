import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, deleteAsset } from '../services/api';
import { Card, PageHeader, Badge, StatusBadge, Table, Pagination, SearchInput, Select, Button, Modal, LoadingSpinner } from '../components/ui';
import { fmtDate, timeAgo } from '../utils/colors';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RISK_OPTIONS = [{ value: '', label: 'All Risk' }, ...['critical','high','medium','low','info'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];
const TYPE_OPTIONS = [{ value: '', label: 'All Types' }, ...['domain','subdomain','ip','service','certificate'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];
const ENV_OPTIONS = [{ value: '', label: 'All Envs' }, ...['production','staging','development'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))];

export default function Assets() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [assetType, setAssetType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [environment, setEnvironment] = useState('');
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    getAssets({ page, size: 20, q: q || undefined, asset_type: assetType || undefined, risk_level: riskLevel || undefined, environment: environment || undefined })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q, assetType, riskLevel, environment]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, assetType, riskLevel, environment]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await deleteAsset(id);
      toast.success('Asset deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'name', label: 'Asset', render: (v, row) => (
      <div>
        <p className="text-gray-100 font-medium text-xs">{v}</p>
        <p className="text-gray-500 text-xs">{row.ip_address || row.asset_type}</p>
      </div>
    )},
    { key: 'asset_type', label: 'Type', render: v => <span className="capitalize text-gray-300 text-xs">{v}</span> },
    { key: 'risk_level', label: 'Risk', render: v => <Badge level={v} /> },
    { key: 'risk_score', label: 'Score', render: v => <span className="text-gray-300 text-xs">{v ? Number(v).toFixed(1) : '—'}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'environment', label: 'Env', render: v => <span className="text-gray-400 text-xs capitalize">{v}</span> },
    { key: 'owner', label: 'Owner', render: v => <span className="text-gray-400 text-xs">{v || '—'}</span> },
    { key: 'last_seen', label: 'Last Seen', render: v => <span className="text-gray-500 text-xs">{timeAgo(v)}</span> },
    { key: 'id', label: '', render: (v, row) => (
      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
        <button onClick={() => setSelected(row)} className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-gray-800">View</button>
        {user?.role !== 'viewer' && (
          <button onClick={() => handleDelete(v)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800">Delete</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="🖥️ Assets" subtitle={`${data.total} total assets in inventory`} />

      <Card>
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-700">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1); }} placeholder="Search assets..." />
          <Select value={assetType} onChange={setAssetType} options={TYPE_OPTIONS} />
          <Select value={riskLevel} onChange={setRiskLevel} options={RISK_OPTIONS} />
          <Select value={environment} onChange={setEnvironment} options={ENV_OPTIONS} />
        </div>
        <Table columns={columns} data={data.items} loading={loading} onRowClick={setSelected} />
        <Pagination total={data.total} page={page} size={20} onPage={setPage} />
      </Card>

      {/* Asset Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Asset Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Name', selected.name],
                ['Type', selected.asset_type],
                ['IP Address', selected.ip_address],
                ['Domain', selected.domain?.domain],
                ['Port', selected.port],
                ['Protocol', selected.protocol],
                ['Service', selected.service],
                ['Version', selected.service_version],
                ['Technology', selected.technology],
                ['Environment', selected.environment],
                ['Owner', selected.owner],
                ['Criticality', selected.criticality],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-gray-200 font-medium mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Risk Assessment</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">{Number(selected.risk_score || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-400">Risk Score</p>
                </div>
                <Badge level={selected.risk_level} className="text-sm px-3 py-1" />
              </div>
              {selected.risk_factors?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {selected.risk_factors.map((f, i) => <li key={i} className="text-xs text-orange-300 flex items-center gap-2"><span>⚠</span>{f}</li>)}
                </ul>
              )}
            </div>
            <div className="text-xs text-gray-500 flex gap-4">
              <span>First seen: {fmtDate(selected.first_seen)}</span>
              <span>Last seen: {fmtDate(selected.last_seen)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
