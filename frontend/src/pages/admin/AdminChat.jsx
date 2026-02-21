import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

export default function AdminChat() {
  const [issues, setIssues] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/issues').then(({ data }) => setIssues(data.issues || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 flex gap-6">
      <div className="w-80 flex-shrink-0">
        <h2 className="font-semibold mb-4">Issues with chat</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {issues.map((i) => (
            <button
              key={i.id}
              onClick={() => setSelectedId(i.id)}
              className={`w-full text-left p-3 rounded border ${selectedId === i.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <p className="font-medium truncate">{i.title}</p>
              <p className="text-sm text-gray-500">{i.department_name}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        {selectedId ? (
          <>
            <Link to={`/admin/issues/${selectedId}`} className="text-blue-600 hover:underline mb-2 inline-block">View full issue →</Link>
            <ChatWindow issueId={selectedId} />
          </>
        ) : (
          <p className="text-gray-500">Select an issue to chat</p>
        )}
      </div>
    </div>
  );
}
