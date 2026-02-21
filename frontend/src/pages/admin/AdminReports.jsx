import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
  const [byDept, setByDept] = useState([]);
  const [byTech, setByTech] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date_from: '', date_to: '', year: new Date().getFullYear() });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.year) params.set('year', filters.year);
    Promise.all([
      api.get(`/reports/by-department?${params}`),
      api.get(`/reports/by-technician?${params}`),
      api.get(`/reports/monthly?${params}`),
    ])
      .then(([d, t, m]) => {
        setByDept(d.data.byDepartment || []);
        setByTech(t.data.byTechnician || []);
        setMonthly(m.data.monthly || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.date_from, filters.date_to, filters.year]);

  async function exportCsv() {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/reports/export-csv?${params}`, { credentials: 'include' });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `issues-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-4">
          <input type="date" value={filters.date_from} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))} className="px-3 py-1 border rounded" />
          <input type="date" value={filters.date_to} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))} className="px-3 py-1 border rounded" />
          <input type="number" value={filters.year} onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))} className="w-24 px-3 py-1 border rounded" placeholder="Year" />
          <button onClick={exportCsv} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Export CSV</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">By Department</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byDept}>
              <XAxis dataKey="department_name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">By Technician</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byTech}>
              <XAxis dataKey="full_name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-4">Monthly Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthly}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#10b981" />
            <Bar dataKey="resolved" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
