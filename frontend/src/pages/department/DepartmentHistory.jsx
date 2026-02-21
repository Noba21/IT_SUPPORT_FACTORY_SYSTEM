import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function DepartmentHistory() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', date_from: '', date_to: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.date_from) params.set('date_from', filter.date_from);
    if (filter.date_to) params.set('date_to', filter.date_to);
    api.get(`/issues?${params}`)
      .then(({ data }) => setIssues(data.issues || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter.status, filter.date_from, filter.date_to]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Requests</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="px-3 py-1 border rounded"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          type="date"
          value={filter.date_from}
          onChange={(e) => setFilter((f) => ({ ...f, date_from: e.target.value }))}
          className="px-3 py-1 border rounded"
        />
        <input
          type="date"
          value={filter.date_to}
          onChange={(e) => setFilter((f) => ({ ...f, date_to: e.target.value }))}
          className="px-3 py-1 border rounded"
        />
      </div>
      <div className="space-y-3">
        {issues.length === 0 ? (
          <p className="text-gray-500">No requests yet.</p>
        ) : (
          issues.map((i) => (
            <Link
              key={i.id}
              to={`/department/history/${i.id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{i.title}</h3>
                  <p className="text-sm text-gray-500">{i.department_name} • {i.created_at?.slice(0, 10)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  i.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  i.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {i.status}
                </span>
              </div>
              {i.technician_name && (
                <p className="text-sm text-gray-600 mt-1">Technician: {i.technician_name}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
