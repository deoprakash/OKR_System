import React, { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { listEmployees, deleteEmployee, updateEmployee } from '../lib/api';
// BackButton removed from this page per request
import NavBar from '../components/NavBar';

function RowEditor({ row, onSave, onCancel }) {
  const [name, setName] = useState(row.empName || '');
  const [designation, setDesignation] = useState(row.empDesignation || '');
  const [level, setLevel] = useState(row.empLevel || '');
  const [email, setEmail] = useState(row.emailId || '');
  const [phone, setPhone] = useState(row.cellNumber || '');
  const [isAdmin, setIsAdmin] = useState(row.isAdmin ? 'Yes' : 'No');

  return (
    <tr>
      <td />
      <td>{row.empCode || ''}</td>
      <td><input className="p-1 border rounded" value={name} onChange={e => setName(e.target.value)} /></td>
      <td><input className="p-1 border rounded" value={designation} onChange={e => setDesignation(e.target.value)} /></td>
      <td><input className="p-1 border rounded w-16" value={level} onChange={e => setLevel(e.target.value)} /></td>
      <td><input className="p-1 border rounded" value={email} onChange={e => setEmail(e.target.value)} /></td>
      <td><input className="p-1 border rounded" value={phone} onChange={e => setPhone(e.target.value)} /></td>
      <td>
        <select className="p-1 border rounded" value={isAdmin} onChange={e => setIsAdmin(e.target.value)}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </td>
      <td className="px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary"
            onClick={() => onSave({ empName: name, empDesignation: designation, empLevel: Number(level||0), emailId: String(email||''), cellNumber: String(phone||''), isAdmin: isAdmin === 'Yes' })}
          >
            Save
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [multiMode, setMultiMode] = useState(false);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('empName');
  const [sortDir, setSortDir] = useState('asc');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await listEmployees();
      setUsers(res.data || []);
    } catch (err) {
      toast.send('Failed to load users: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const toggleAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(users.map(u => u._id || u.empCode)));
    } else setSelected(new Set());
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteEmployee(id);
      toast.send('Deleted', 'info');
      setUsers((list) => list.filter(u => (u._id || u.empCode) !== id));
      const s = new Set(selected); s.delete(id); setSelected(s);
    } catch (err) {
      toast.send('Delete failed: ' + (err.message || err), 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return toast.send('No users selected', 'error');
    if (!confirm('Delete selected users?')) return;
    try {
      const ids = Array.from(selected);
      await Promise.all(ids.map(id => deleteEmployee(id)));
      toast.send('Deleted selected users', 'info');
      setUsers((list) => list.filter(u => !ids.includes(u._id || u.empCode)));
      setSelected(new Set());
    } catch (err) {
      toast.send('Bulk delete failed: ' + (err.message || err), 'error');
    }
  };

  const saveEdit = async (id, payload) => {
    try {
      await updateEmployee(id, payload);
      toast.send('Updated', 'info');
      setEditingId(null);
      fetch();
    } catch (err) {
      toast.send('Update failed: ' + (err.message || err), 'error');
    }
  };

  const filtered = users.filter(u => {
    if (!q) return true;
    const s = String(q).toLowerCase();
    return (String(u.empName||'')+String(u.emailId||'')+String(u.cellNumber||'')+String(u.empDesignation||'')).toLowerCase().includes(s);
  });

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = filtered.slice().sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (va == null && vb == null) return 0;
    if (va == null) return sortDir === 'asc' ? 1 : -1;
    if (vb == null) return sortDir === 'asc' ? -1 : 1;
    // numeric compare for empCode/empLevel
    if (sortKey === 'empCode' || sortKey === 'empLevel') {
      const na = Number(va || 0);
      const nb = Number(vb || 0);
      return sortDir === 'asc' ? na - nb : nb - na;
    }
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <NavBar />
      <div className="flex-1 p-4 sm:p-8 mt-10">
        <div className="glass-card rounded-2xl p-5 sm:p-8 max-w-7xl mx-auto fade-in">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="text-sm text-slate-600">{loading ? 'Loading…' : `${users.length} users`}</div>
        </div>

        <div className="flex items-center gap-4 mb-6 sm:flex-row flex-col">
          <div className="flex items-center gap-3 flex-1">
            <input placeholder="Search by name, email, phone or designation" className="p-2 border rounded flex-1" value={q} onChange={e => setQ(e.target.value)} />
            <button className="btn btn-ghost" onClick={fetch}>Refresh</button>
          </div>
          <div className="flex items-center gap-3">
            {!multiMode ? (
              <button className="btn btn-ghost" onClick={() => { setMultiMode(true); setSelected(new Set()); }}>Delete multiple</button>
            ) : (
              <>
                <button className="btn btn-danger" onClick={handleBulkDelete}>Delete Selected</button>
                <button className="btn btn-ghost" onClick={() => { setMultiMode(false); setSelected(new Set()); }}>Cancel</button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded">
          <table className="w-full border-collapse admin-table text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 sticky top-0">
                  {multiMode && (
                    <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left w-12">{multiMode ? <input type="checkbox" onChange={toggleAll} checked={selected.size === users.length && users.length>0} /> : null}</th>
                  )}
                  <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left w-12">S. No</th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left w-24">Employee User ID</th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left w-48 cursor-pointer" onClick={() => toggleSort('empName')}>
                  Name {sortKey === 'empName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left">Designation</th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-center w-16">Level</th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left w-64">Email</th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-left w-36">Phone</th>
                <th className="border-r border-white/10 px-3 sm:px-4 py-3 text-center w-28">Admin</th>
                <th className="px-3 sm:px-4 py-3 text-left w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(sorted || []).map((u, idx) => {
                const id = u._id || u.empCode;
                if (editingId === id) {
                  return <RowEditor key={id} row={u} onSave={(payload) => saveEdit(id, payload)} onCancel={() => setEditingId(null)} />;
                }
                return (
                  <tr key={id} className="border-b hover:bg-white/5 transition-colors">
                    {multiMode && (
                      <td className="px-3 sm:px-4 py-3">{multiMode ? <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} /> : null}</td>
                    )}
                    <td className="px-3 sm:px-4 py-3 text-slate-500">{idx + 1}</td>
                    <td className="px-3 sm:px-4 py-3 font-semibold">{u.userId || u.empCode || (u._id || '').slice(0,8)}</td>
                    <td className="px-3 sm:px-4 py-3 font-medium">{u.empName}</td>
                    <td className="px-3 sm:px-4 py-3">{u.empDesignation}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">{u.empLevel}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm">{u.emailId}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm">{u.cellNumber}</td>
                    <td className="px-3 sm:px-4 py-3 text-center w-28">{u.isAdmin ? 'Yes' : 'No'}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={() => setEditingId(id)}>Update</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
