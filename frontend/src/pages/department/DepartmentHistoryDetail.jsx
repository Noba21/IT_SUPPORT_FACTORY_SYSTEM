import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

export default function DepartmentHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/issues/${id}`).then(({ data }) => setIssue(data.issue)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function setFeedback(feedback) {
    try {
      await api.put(`/issues/${id}/feedback`, { feedback });
      setIssue((i) => ({ ...i, user_feedback: feedback }));
    } catch (e) {
      console.error(e);
    }
  }

  if (loading || !issue) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">← Back</button>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <p className="text-gray-500 mt-1">{issue.department_name} • {issue.created_at?.slice(0, 10)}</p>
        <p className="mt-4">{issue.description}</p>
        {issue.screenshot && <img src={`/uploads/${issue.screenshot}`} alt="Screenshot" className="mt-4 max-w-md rounded" />}
        <p className="mt-4"><span className="font-medium">Status:</span> <span className={`px-2 py-0.5 rounded text-sm ${issue.status === 'resolved' ? 'bg-green-100' : 'bg-yellow-100'}`}>{issue.status}</span></p>
        {issue.technician_name && <p className="mt-2"><span className="font-medium">Technician:</span> {issue.technician_name}</p>}
        {issue.resolution_note && <p className="mt-4 p-3 bg-gray-50 rounded"><span className="font-medium">Resolution:</span> {issue.resolution_note}</p>}
        {issue.status === 'resolved' && !issue.user_feedback && (
          <div className="mt-4">
            <p className="font-medium mb-2">Was this issue fixed?</p>
            <div className="flex gap-4">
              <button onClick={() => setFeedback('fixed')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Fixed</button>
              <button onClick={() => setFeedback('not_fixed')} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Not Fixed</button>
            </div>
          </div>
        )}
        {issue.user_feedback && <p className="mt-4 text-sm text-gray-600">Your feedback: {issue.user_feedback}</p>}
      </div>
      <div>
        <h2 className="font-semibold mb-2">Chat</h2>
        <ChatWindow issueId={parseInt(id)} />
      </div>
    </div>
  );
}
