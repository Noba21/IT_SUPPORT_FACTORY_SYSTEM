import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tab, setTab] = useState('technicians');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'technician' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.departments || []));
  }, []);

  useEffect(() => {
    const url = tab === 'technicians' ? '/users/technicians' : '/users/departments';
    api.get(url).then(({ data }) => setUsers(data.users || [])).catch(console.error).finally(() => setLoading(false));
  }, [tab]);

  async function createUser(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form);
      setShowForm(false);
      setForm({ full_name: '', email: '', phone: '', password: '', role: 'technician' });
      api.get('/users/technicians').then(({ data }) => setUsers(data.users || []));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    }
  }

  async function toggleStatus(u) {
    try {
      await api.put(`/users/${u.id}/status`, { status: u.status === 'active' ? 'inactive' : 'active' });
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x));
    } catch (e) { console.error(e); }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('technicians')} className={`px-4 py-2 rounded ${tab === 'technicians' ? 'bg-slate-700 text-white' : 'bg-gray-200'}`}>Technicians</button>
          <button onClick={() => setTab('departments')} className={`px-4 py-2 rounded ${tab === 'departments' ? 'bg-slate-700 text-white' : 'bg-gray-200'}`}>Department Users</button>
          {tab === 'technicians' && (
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Add Technician</button>
          )}
        </div>
      </div>
      {showForm && (
        <form onSubmit={createUser} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="w-full px-4 py-2 border rounded" required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 border rounded" required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2 border rounded" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2 border rounded" required />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Status</th>
                {tab === 'technicians' && <th className="px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.full_name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.department_name || '-'}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs ${u.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>{u.status}</span></td>
                  {tab === 'technicians' && (
                    <td className="px-4 py-2">
                      <button onClick={() => toggleStatus(u)} className="text-sm text-blue-600 hover:underline">
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
