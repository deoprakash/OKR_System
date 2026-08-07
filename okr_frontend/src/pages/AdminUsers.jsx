import React, { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { listEmployees, deleteEmployee, updateEmployee } from '../lib/api';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

function InlineEditor({ row, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: row.empName || '',
    designation: row.empDesignation || '',
    level: row.empLevel || '',
    email: row.emailId || '',
    phone: row.cellNumber || '',
    isAdmin: row.isAdmin ? 'Yes' : 'No',
  });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <tr className="bg-brand-light/30 border-b border-brand-border">
      <td className="px-4 py-3 w-10" />
      <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{row.userId || row.empCode || '—'}</td>
      <td className="px-4 py-3"><Input value={form.name} onChange={e => u('name', e.target.value)} /></td>
      <td className="px-4 py-3"><Input value={form.designation} onChange={e => u('designation', e.target.value)} /></td>
      <td className="px-4 py-3 text-center">
        <Select value={String(form.level)} onChange={e => u('level', e.target.value)}>
          {[1,2,3,4,5,6,7].map(l => <option key={l} value={String(l)}>L{l}</option>)}
        </Select>
      </td>
      <td className="px-4 py-3"><Input value={form.email} onChange={e => u('email', e.target.value)} /></td>
      <td className="px-4 py-3"><Input value={form.phone} onChange={e => u('phone', e.target.value)} /></td>
      <td className="px-4 py-3 text-center">
        <Select value={form.isAdmin} onChange={e => u('isAdmin', e.target.value)}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </Select>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={() => onSave({
            empName: form.name, empDesignation: form.designation, empLevel: Number(form.level || 0),
            emailId: form.email, cellNumber: form.phone, isAdmin: form.isAdmin === 'Yes'
          })}>Save</Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
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

  const loadUsers = async () => {
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

  useEffect(() => { loadUsers(); }, []);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };
  const toggleAll = (e) => {
    if (e.target.checked) setSelected(new Set(users.map(u => u._id || u.empCode)));
    else setSelected(new Set());
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteEmployee(id);
      toast.send('User deleted', 'success');
      setUsers(l => l.filter(u => (u._id || u.empCode) !== id));
    } catch (err) { toast.send('Delete failed: ' + err.message, 'error'); }
  };
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} users?`)) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => deleteEmployee(id)));
    setUsers(l => l.filter(u => !ids.includes(u._id || u.empCode)));
    setSelected(new Set()); setMultiMode(false);
    toast.send(`${ids.length} users deleted`, 'success');
  };
  const saveEdit = async (id, payload) => {
    try {
      await updateEmployee(id, payload);
      toast.send('User updated', 'success');
      setEditingId(null);
      loadUsers();
    } catch (err) { toast.send('Update failed: ' + err.message, 'error'); }
  };

  const filtered = users.filter(u => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (String(u.empName || '') + String(u.emailId || '') + String(u.cellNumber || '') + String(u.empDesignation || '')).toLowerCase().includes(s);
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = filtered.slice().sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    if (va == null && vb == null) return 0;
    if (va == null) return sortDir === 'asc' ? 1 : -1;
    if (vb == null) return sortDir === 'asc' ? -1 : 1;
    if (sortKey === 'empLevel') return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-neutral-300 inline-flex flex-col" style={{ fontSize: 8, lineHeight: 1 }}>
      <span className={sortKey === col && sortDir === 'asc' ? 'text-brand-primary' : ''}>▲</span>
      <span className={sortKey === col && sortDir === 'desc' ? 'text-brand-primary' : ''}>▼</span>
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">

          {/* Page Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-1">User Management</h1>
              <p className="text-sm text-neutral-500">
                {loading ? 'Loading...' : `${users.length} employee${users.length !== 1 ? 's' : ''} in the organization`}
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/employee-master'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </Button>
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card px-5 py-4 mb-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-56">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary transition-all placeholder-neutral-400"
                    placeholder="Search by name, email, phone, designation..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" size="sm" onClick={loadUsers}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
                {!multiMode ? (
                  <Button variant="secondary" size="sm" onClick={() => { setMultiMode(true); setSelected(new Set()); }}>
                    Select Multiple
                  </Button>
                ) : (
                  <>
                    <Badge variant="blue" size="lg">{selected.size} selected</Badge>
                    <Button variant="danger" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setMultiMode(false); setSelected(new Set()); }}>Cancel</Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    {multiMode && (
                      <th className="px-4 py-3.5 w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary/20"
                          onChange={toggleAll}
                          checked={selected.size === users.length && users.length > 0}
                        />
                      </th>
                    )}
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-10">#</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-28">User ID</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700" onClick={() => toggleSort('empName')}>
                      Name <SortIcon col="empName" />
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Designation</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700 w-20" onClick={() => toggleSort('empLevel')}>
                      Level <SortIcon col="empLevel" />
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-36">Phone</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">Role</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td colSpan={multiMode ? 10 : 9}>
                        <EmptyState
                          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                          title={q ? "No matching employees" : "No employees yet"}
                          description={q ? `No results for "${q}". Try a different search.` : "Add your first employee to get started."}
                        />
                      </td>
                    </tr>
                  ) : (
                    sorted.map((u, idx) => {
                      const id = u._id || u.empCode;
                      if (editingId === id) {
                        return <InlineEditor key={id} row={u} onSave={(payload) => saveEdit(id, payload)} onCancel={() => setEditingId(null)} />;
                      }
                      return (
                        <motion.tr
                          key={id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-neutral-50 transition-colors"
                        >
                          {multiMode && (
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary/20"
                                checked={selected.has(id)}
                                onChange={() => toggle(id)}
                              />
                            </td>
                          )}
                          <td className="px-4 py-3.5 text-neutral-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-neutral-400">{u.userId || u.empCode || '—'}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(u.empName || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-neutral-900">{u.empName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600">{u.empDesignation || '—'}</td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant="blue" size="sm">L{u.empLevel}</Badge>
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600 text-sm">{u.emailId}</td>
                          <td className="px-4 py-3.5 text-neutral-600 text-sm">{u.cellNumber}</td>
                          <td className="px-4 py-3.5 text-center">
                            {u.isAdmin
                              ? <Badge variant="indigo" size="sm">Admin</Badge>
                              : <Badge variant="gray" size="sm">User</Badge>
                            }
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingId(id)}
                                className="p-1.5 rounded-lg hover:bg-brand-light text-neutral-400 hover:text-brand-primary transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(id)}
                                className="p-1.5 rounded-lg hover:bg-danger-light text-neutral-400 hover:text-danger transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
