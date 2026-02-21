import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ChatWindow({ issueId }) {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!issueId) return;
    api.get(`/chats/${issueId}/messages`)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [issueId]);

  useEffect(() => {
    if (!socket || !issueId) return;
    socket.emit('join_issue', issueId, (res) => res?.error && console.error(res.error));
    socket.on('new_message', (msg) => setMessages((m) => [...m, msg]));
    return () => {
      socket.emit('leave_issue', issueId);
      socket.off('new_message');
    };
  }, [socket, issueId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    if (!content.trim() || !socket) return;
    socket.emit('send_message', { issueId, content: content.trim() }, (res) => {
      if (res?.error) console.error(res.error);
      else setContent('');
    });
  }

  if (loading) return <div className="p-4">Loading chat...</div>;

  return (
    <div className="flex flex-col h-80 border rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.user_id === user?.id ? 'justify-end' : ''}`}>
            <div className={`max-w-[80%] px-3 py-1 rounded ${m.user_id === user?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
              <p className="text-xs text-gray-500">{m.full_name} ({m.role})</p>
              <p>{m.content}</p>
              <p className="text-xs text-gray-400">{m.created_at?.slice(0, 19)}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Type message..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
}
