import { query, queryOne } from '../config/db.js';

export async function findById(id) {
  return queryOne(
    `SELECT i.*, u.full_name AS user_name, u.email AS user_email, u.department_id AS user_department_id,
            d.name AS department_name, t.full_name AS technician_name
     FROM issues i
     JOIN users u ON i.user_id = u.id
     LEFT JOIN departments d ON u.department_id = d.id
     LEFT JOIN users t ON i.technician_id = t.id
     WHERE i.id = ?`,
    [id]
  );
}

export async function findAll(filters = {}) {
  let sql = `
    SELECT i.id, i.user_id, i.technician_id, i.title, i.description, i.screenshot, i.priority, i.status,
           i.resolution_note, i.user_feedback, i.created_at, i.resolved_at,
           u.full_name AS user_name, u.department_id, d.name AS department_name,
           t.full_name AS technician_name
    FROM issues i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN users t ON i.technician_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.user_id) {
    sql += ' AND i.user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.technician_id) {
    sql += ' AND i.technician_id = ?';
    params.push(filters.technician_id);
  }
  if (filters.status) {
    sql += ' AND i.status = ?';
    params.push(filters.status);
  }
  if (filters.priority) {
    sql += ' AND i.priority = ?';
    params.push(filters.priority);
  }
  if (filters.department_id) {
    sql += ' AND u.department_id = ?';
    params.push(filters.department_id);
  }
  if (filters.date_from) {
    sql += ' AND DATE(i.created_at) >= ?';
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    sql += ' AND DATE(i.created_at) <= ?';
    params.push(filters.date_to);
  }

  sql += ' ORDER BY i.created_at DESC';
  return query(sql, params);
}

export async function create(data) {
  const { user_id, title, description, screenshot, priority } = data;
  const result = await query(
    `INSERT INTO issues (user_id, title, description, screenshot, priority, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [user_id, title, description, screenshot || null, priority || 'not_urgent']
  );
  return result.insertId;
}

export async function update(id, data) {
  const allowed = ['technician_id', 'status', 'resolution_note', 'user_feedback', 'resolved_at'];
  const updates = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (updates.length === 0) return null;

  params.push(id);
  await query(`UPDATE issues SET ${updates.join(', ')} WHERE id = ?`, params);
  return id;
}

export async function assignTechnician(id, technician_id) {
  return update(id, { technician_id, status: 'in_progress' });
}

export async function setStatus(id, status) {
  const data = { status };
  if (status === 'resolved') data.resolved_at = new Date();
  return update(id, data);
}

export async function setFeedback(id, user_feedback) {
  return update(id, { user_feedback });
}
