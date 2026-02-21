import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as chatModel from '../models/chatModel.js';
import * as messageModel from '../models/messageModel.js';
import * as issueModel from '../models/issueModel.js';

function parseCookie(str) {
  if (!str) return {};
  return str.split(';').reduce((acc, part) => {
    const [k, v] = part.trim().split('=');
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

function canAccessIssue(user, issue) {
  if (user.role === 'admin') return true;
  if (user.role === 'technician' && issue.technician_id === user.id) return true;
  if (user.role === 'department' && issue.user_id === user.id) return true;
  return false;
}

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) return next(new Error('Server configuration error'));
      const cookies = parseCookie(socket.handshake.headers.cookie);
      const token = cookies.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, secret);
      socket.user = { id: decoded.id, email: decoded.email, role: decoded.role };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_issue', async (issueId, cb) => {
      try {
        const issue = await issueModel.findById(issueId);
        if (!issue) return cb?.({ error: 'Issue not found' });
        if (!canAccessIssue(socket.user, issue)) return cb?.({ error: 'Access denied' });

        const room = `issue:${issueId}`;
        socket.join(room);
        cb?.({ ok: true });
      } catch (err) {
        cb?.({ error: err.message });
      }
    });

    socket.on('leave_issue', (issueId) => {
      socket.leave(`issue:${issueId}`);
    });

    socket.on('send_message', async (data, cb) => {
      try {
        const { issueId, content } = data;
        if (!issueId || !content?.trim()) return cb?.({ error: 'Issue ID and content required' });

        const issue = await issueModel.findById(issueId);
        if (!issue) return cb?.({ error: 'Issue not found' });
        if (!canAccessIssue(socket.user, issue)) return cb?.({ error: 'Access denied' });

        let chat = await chatModel.findByIssueId(issueId);
        if (!chat) {
          await chatModel.createForIssue(issueId);
          chat = await chatModel.findByIssueId(issueId);
        }

        const msgId = await messageModel.create(chat.id, socket.user.id, content.trim());
        const message = await messageModel.findById(msgId);

        const payload = {
          id: message.id,
          chat_id: message.chat_id,
          user_id: message.user_id,
          content: message.content,
          created_at: message.created_at,
          full_name: message.full_name,
          role: message.role,
        };

        io.to(`issue:${issueId}`).emit('new_message', payload);
        cb?.({ ok: true, message: payload });
      } catch (err) {
        cb?.({ error: err.message });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
