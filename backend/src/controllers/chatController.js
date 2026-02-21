import * as chatModel from '../models/chatModel.js';
import * as messageModel from '../models/messageModel.js';
import * as issueModel from '../models/issueModel.js';

function canAccessChat(user, issue) {
  if (user.role === 'admin') return true;
  if (user.role === 'technician' && issue.technician_id === user.id) return true;
  if (user.role === 'department' && issue.user_id === user.id) return true;
  return false;
}

export async function getMessages(req, res, next) {
  try {
    const { issueId } = req.params;
    const issue = await issueModel.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (!canAccessChat(req.user, issue)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const chat = await chatModel.findByIssueId(issueId);
    if (!chat) return res.json({ messages: [] });

    const messages = await messageModel.findByChatId(chat.id);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { issueId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const issue = await issueModel.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (!canAccessChat(req.user, issue)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let chat = await chatModel.findByIssueId(issueId);
    if (!chat) {
      await chatModel.createForIssue(issueId);
      chat = await chatModel.findByIssueId(issueId);
    }

    const id = await messageModel.create(chat.id, req.user.id, content.trim());
    const message = await messageModel.findById(id);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}
