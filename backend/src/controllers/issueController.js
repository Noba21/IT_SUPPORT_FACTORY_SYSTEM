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
    const { status, priority, department_id, date_from, date_to, feedback } = req.query;
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
    if (req.user.role === 'admin' && feedback) filters.user_feedback = feedback === 'none' ? 'none' : feedback;

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
    const { title, description, priority, problem_type } = req.body;
    const screenshot = req.file ? `screenshots/${req.file.filename}` : null;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }
    if (description.trim().length < 12) {
      return res.status(400).json({ error: 'Description must be at least 12 characters' });
    }

    const normalizedProblemType =
      typeof problem_type === 'string' && ['hardware', 'software'].includes(problem_type.trim().toLowerCase())
        ? problem_type.trim().toLowerCase()
        : null;

    const id = await issueModel.create({
      user_id: req.user.id,
      title: title.trim(),
      description: description.trim(),
      screenshot,
      problem_type: normalizedProblemType,
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

    const {
      technician_id,
      status,
      resolution_note,
      material_requirements,
      needs_outsourcing,
      outsourcing_note,
    } = req.body;
    const data = {};

    if (req.user.role === 'admin' || req.user.role === 'technician') {
      if (technician_id !== undefined) data.technician_id = technician_id || null;
      if (status !== undefined) data.status = status;
      if (resolution_note !== undefined) {
        data.resolution_note = resolution_note;
        data.user_feedback = null;
      }
      if (status === 'resolved') data.resolved_at = new Date();

      if (material_requirements !== undefined) {
        if (Array.isArray(material_requirements)) {
          data.material_requirements = material_requirements.join(',');
        } else if (typeof material_requirements === 'string') {
          data.material_requirements = material_requirements;
        }
      }

      if (needs_outsourcing !== undefined) {
        let normalized = null;
        if (typeof needs_outsourcing === 'boolean') {
          normalized = needs_outsourcing ? 1 : 0;
        } else if (typeof needs_outsourcing === 'number') {
          normalized = needs_outsourcing ? 1 : 0;
        } else if (typeof needs_outsourcing === 'string') {
          const v = needs_outsourcing.toLowerCase();
          if (v === 'true' || v === '1' || v === 'yes') normalized = 1;
          if (v === 'false' || v === '0' || v === 'no') normalized = 0;
        }
        if (normalized !== null) {
          data.needs_outsourcing = normalized;
        }
      }

      if (outsourcing_note !== undefined) {
        const trimmed = typeof outsourcing_note === 'string' ? outsourcing_note.trim() : '';
        data.outsourcing_note = trimmed || null;
      }
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

export async function uploadOutsourcingScreenshot(req, res, next) {
  try {
    const issue = await issueModel.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Only admin/assigned technician can upload outsourcing screenshot
    if (!canAccessIssue(req.user, issue) || req.user.role === 'department') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Outsourcing screenshot file is required' });
    }

    const newPath = `screenshots/${req.file.filename}`;
    let existing = issue.outsourcing_screenshot || '';
    const parts = existing
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    parts.push(newPath);
    const outsourcing_screenshot = parts.join(',');

    await issueModel.update(req.params.id, { outsourcing_screenshot });

    const updated = await issueModel.findById(req.params.id);
    res.json({ issue: updated });
  } catch (err) {
    next(err);
  }
}
