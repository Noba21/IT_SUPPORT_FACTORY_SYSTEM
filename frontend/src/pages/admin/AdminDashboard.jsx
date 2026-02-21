import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [byDept, setByDept] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/by-department'),
      api.get('/reports/monthly'),
    ])
      .then(([s, d, m]) => {
        setSummary(s.data.summary);
        setByDept(d.data.byDepartment || []);
        setMonthly(m.data.monthly || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  const pieData = summary
    ? [
        { name: 'Urgent', value: Number(summary.urgent) || 0 },
        { name: 'Not Urgent', value: Number(summary.not_urgent) || 0 },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Issues" value={summary?.total ?? 0} />
        <Card title="Resolved" value={summary?.resolved ?? 0} />
        <Card title="Pending" value={summary?.pending ?? 0} />
        <Card title="Urgent" value={summary?.urgent ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Urgent vs Not Urgent</h2>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Issues by Department</h2>
          {byDept.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byDept}>
                <XAxis dataKey="department_name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-4">Monthly Trend</h2>
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" />
              <Bar dataKey="resolved" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No data</p>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
