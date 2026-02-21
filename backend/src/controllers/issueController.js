import * as issueModel from '../models/issueModel.js';
import * as chatModel from '../models/chatModel.js';

function canAccessIssue(user, issue) {
  if (user.role === 'admin') return true;
  if (user.role === 'technician' && issue.technician_id === user.id) return true;
  if (user.role === 'department' && issue.user_id === user.id) return true;
  return false;
}

export async function list(req, res, next) {
  try {
    const { status, priority, department_id, date_from, date_to } = req.query;
    const filters = {};

    if (req.user.role === 'department') {
      filters.user_id = req.user.id;
    } else if (req.user.role === 'technician') {
      filters.technician_id = req.user.id;
    }

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (department_id) filters.department_id = department_id;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const issues = await issueModel.findAll(filters);
    res.json({ issues });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const issue = await issueModel.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (!canAccessIssue(req.user, issue)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ issue });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { title, description, priority } = req.body;
    const screenshot = req.file ? `screenshots/${req.file.filename}` : null;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }
    if (description.trim().length < 12) {
      return res.status(400).json({ error: 'Description must be at least 12 characters' });
    }

    const id = await issueModel.create({
      user_id: req.user.id,
      title: title.trim(),
      description: description.trim(),
      screenshot,
      priority: priority === 'urgent' ? 'urgent' : 'not_urgent',
    });

    await chatModel.createForIssue(id);
    const issue = await issueModel.findById(id);
    res.status(201).json({ issue });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const issue = await issueModel.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (!canAccessIssue(req.user, issue)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { technician_id, status, resolution_note } = req.body;
    const data = {};

    if (req.user.role === 'admin' || req.user.role === 'technician') {
      if (technician_id !== undefined) data.technician_id = technician_id || null;
      if (status !== undefined) data.status = status;
      if (resolution_note !== undefined) data.resolution_note = resolution_note;
      if (status === 'resolved') data.resolved_at = new Date();
    }

    if (Object.keys(data).length > 0) {
      await issueModel.update(req.params.id, data);
    }

    const updated = await issueModel.findById(req.params.id);
    res.json({ issue: updated });
  } catch (err) {
    next(err);
  }
}

export async function setFeedback(req, res, next) {
  try {
    const { feedback } = req.body;
    if (!['fixed', 'not_fixed'].includes(feedback)) {
      return res.status(400).json({ error: 'Feedback must be fixed or not_fixed' });
    }

    const issue = await issueModel.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (issue.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can set feedback' });
    }
    if (issue.status !== 'resolved') {
      return res.status(400).json({ error: 'Issue must be resolved first' });
    }

    await issueModel.setFeedback(req.params.id, feedback);
    const updated = await issueModel.findById(req.params.id);
    res.json({ issue: updated });
  } catch (err) {
    next(err);
  }
}
