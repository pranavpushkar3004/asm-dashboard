import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { Card, PageHeader, StatusBadge, Table, Modal, Button, Select } from '../components/ui';
import { fmtDate, fmtDateTime } from '../utils/colors';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTS = ['admin','analyst','viewer'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }));

export default function Settings() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', role: 'viewer' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    getUsers()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser(form);
      toast.success('User created');
      setShowAdd(false);
      setForm({ username: '', email: '', full_name: '', password: '', role: 'viewer' });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      await updateUser(u.id, { is_active: !u.is_active });
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const columns = [
    { key: 'username', label: 'Username', render: v => <span className="text-cyan-400 font-mono text-xs">{v}</span> },
    { key: 'full_name', label: 'Name', render: v => <span className="text-gray-200 text-xs">{v || '—'}</span> },
    { key: 'email', label: 'Email', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'role', label: 'Role', render: v => (
      <span className={`text-xs font-medium ${v === 'admin' ? 'text-red-400' : v === 'analyst' ? 'text-yellow-400' : 'text-green-400'}`}>{v}</span>
    )},
    { key: 'is_active', label: 'Status', render: v => <StatusBadge status={v ? 'active' : 'inactive'} /> },
    { key: 'last_login', label: 'Last Login', render: v => <span className="text-gray-500 text-xs">{fmtDateTime(v)}</span> },
    { key: 'id', label: '', render: (v, row) => user?.id !== v ? (
      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
        <button onClick={() => handleToggle(row)} className="text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded hover:bg-gray-800">
          {row.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button onClick={() => handleDelete(v)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800">Delete</button>
      </div>
    ) : <span className="text-xs text-gray-500">You</span> },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="⚙️ Users & Settings" subtitle="Manage platform users and roles"
        action={<Button onClick={() => setShowAdd(true)}>+ Add User</Button>} />

      <Card title="Platform Users">
        <Table columns={columns} data={data.items} loading={loading} />
      </Card>

      {/* Role Permissions Guide */}
      <Card title="Role Permissions">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { role: 'Admin', color: 'text-red-400', border: 'border-red-800', perms: ['Full platform access', 'User management', 'All CRUD operations', 'Scan initiation', 'Domain approval'] },
            { role: 'Analyst', color: 'text-yellow-400', border: 'border-yellow-800', perms: ['View all data', 'Update vulnerabilities', 'Manage alerts', 'Run scans', 'Add/approve domains'] },
            { role: 'Viewer', color: 'text-green-400', border: 'border-green-800', perms: ['View all data', 'Read-only access', 'No modifications', 'No scans', 'No user management'] },
          ].map(({ role, color, border, perms }) => (
            <div key={role} className={`border ${border} rounded-lg p-4`}>
              <h3 className={`font-semibold ${color} mb-3`}>{role}</h3>
              <ul className="space-y-1">
                {perms.map(p => <li key={p} className="text-xs text-gray-400 flex items-center gap-2"><span className="text-green-500">✓</span>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New User">
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            ['username','Username','text',true],
            ['email','Email Address','email',true],
            ['full_name','Full Name','text',false],
            ['password','Password','password',true],
          ].map(([k, p, t, req]) => (
            <div key={k}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{k.replace('_',' ')}</label>
              <input type={t} required={req} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                placeholder={p} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white">
              {ROLE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAdd(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
