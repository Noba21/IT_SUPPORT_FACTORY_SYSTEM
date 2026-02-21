import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

export default function TechnicianIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/issues/${id}`).then(({ data }) => {
      setIssue(data.issue);
      setResolutionNote(data.issue?.resolution_note || '');
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status) {
    try {
      await api.put(`/issues/${id}`, { status });
      setIssue((i) => ({ ...i, status }));
    } catch (e) { console.error(e); }
  }

  async function saveResolution() {
    try {
      await api.put(`/issues/${id}`, { resolution_note: resolutionNote });
      setIssue((i) => ({ ...i, resolution_note: resolutionNote }));
    } catch (e) { console.error(e); }
  }

  if (loading || !issue) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">← Back</button>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <p className="text-gray-500 mt-1">{issue.department_name} • {issue.user_name} • {issue.user_email}</p>
        <p className="mt-4">{issue.description}</p>
        {issue.screenshot && <img src={`/uploads/${issue.screenshot}`} alt="Screenshot" className="mt-4 max-w-md rounded" />}
        <div className="mt-4 flex gap-4">
          <select value={issue.status} onChange={(e) => updateStatus(e.target.value)} className="px-3 py-1 border rounded">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Resolution note</label>
          <textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded" />
          <button onClick={saveResolution} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Chat</h2>
        <ChatWindow issueId={parseInt(id)} />
      </div>
    </div>
  );
}
