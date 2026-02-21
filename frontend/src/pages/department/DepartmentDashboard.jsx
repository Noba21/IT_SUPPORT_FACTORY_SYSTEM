import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/issues').then(({ data }) => setIssues(data.issues || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = issues.filter((i) => i.status !== 'resolved').length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold">{issues.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold">{resolved}</p>
        </div>
        <Link to="/department/request" className="bg-emerald-600 text-white rounded-lg shadow p-4 flex items-center justify-center hover:bg-emerald-700">
          New Request
        </Link>
      </div>
      <div>
        <h2 className="font-semibold mb-4">Recent Requests</h2>
        <div className="space-y-3">
          {issues.slice(0, 5).map((i) => (
            <Link key={i.id} to={`/department/history/${i.id}`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md">
              <div className="flex justify-between">
                <span className="font-medium">{i.title}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${i.status === 'resolved' ? 'bg-green-100' : 'bg-yellow-100'}`}>{i.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{i.created_at?.slice(0, 10)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
