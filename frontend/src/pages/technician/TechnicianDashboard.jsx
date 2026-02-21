import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function TechnicianDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/issues')
      .then(({ data }) => setIssues(data.issues || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assigned Issues</h1>
      <div className="space-y-3">
        {issues.length === 0 ? (
          <p className="text-gray-500">No assigned issues.</p>
        ) : (
          issues.map((i) => (
            <Link
              key={i.id}
              to={`/technician/issues/${i.id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{i.title}</h3>
                  <p className="text-sm text-gray-500">{i.department_name} • {i.user_name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  i.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  i.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {i.status}
                </span>
              </div>
              {i.priority === 'urgent' && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Urgent</span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
