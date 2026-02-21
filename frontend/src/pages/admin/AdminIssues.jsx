import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', department_id: '', date_from: '', date_to: '' });

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.departments || []));
    api.get('/users/technicians').then(({ data }) => setTechnicians(data.users || []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/issues?${params}`)
      .then(({ data }) => setIssues(data.issues || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter.status, filter.priority, filter.department_id, filter.date_from, filter.date_to]);

  async function assignTech(issueId, technicianId) {
    try {
      await api.put(`/issues/${issueId}`, { technician_id: technicianId || null, status: technicianId ? 'in_progress' : 'pending' });
      setIssues((prev) => prev.map((i) => i.id === issueId ? { ...i, technician_id: technicianId, technician_name: technicians.find((t) => t.id == technicianId)?.full_name, status: technicianId ? 'in_progress' : 'pending' } : i));
    } catch (e) {
      console.error(e);
    }
  }

  async function setStatus(issueId, status) {
    try {
      await api.put(`/issues/${issueId}`, { status });
      setIssues((prev) => prev.map((i) => i.id === issueId ? { ...i, status } : i));
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Issues</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        <select value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))} className="px-3 py-1 border rounded">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filter.priority} onChange={(e) => setFilter((f) => ({ ...f, priority: e.target.value }))} className="px-3 py-1 border rounded">
          <option value="">All priority</option>
          <option value="urgent">Urgent</option>
          <option value="not_urgent">Not Urgent</option>
        </select>
        <select value={filter.department_id} onChange={(e) => setFilter((f) => ({ ...f, department_id: e.target.value }))} className="px-3 py-1 border rounded">
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input type="date" value={filter.date_from} onChange={(e) => setFilter((f) => ({ ...f, date_from: e.target.value }))} className="px-3 py-1 border rounded" />
        <input type="date" value={filter.date_to} onChange={(e) => setFilter((f) => ({ ...f, date_to: e.target.value }))} className="px-3 py-1 border rounded" />
      </div>
      <div className="space-y-3">
        {issues.map((i) => (
          <div key={i.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <Link to={`/admin/issues/${i.id}`} className="font-medium hover:underline">{i.title}</Link>
              <span className={`px-2 py-0.5 rounded text-xs ${i.status === 'resolved' ? 'bg-green-100' : i.status === 'in_progress' ? 'bg-blue-100' : 'bg-yellow-100'}`}>{i.status}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{i.department_name} • {i.user_name} • {i.created_at?.slice(0, 10)}</p>
            <div className="flex gap-4 mt-3 flex-wrap">
              <select value={i.technician_id || ''} onChange={(e) => assignTech(i.id, e.target.value || null)} className="text-sm px-2 py-1 border rounded">
                <option value="">Assign...</option>
                {technicians.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <select value={i.status} onChange={(e) => setStatus(i.id, e.target.value)} className="text-sm px-2 py-1 border rounded">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
