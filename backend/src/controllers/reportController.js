import { query } from '../config/db.js';

export async function summary(req, res, next) {
  try {
    const [totals] = await query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) AS urgent,
        SUM(CASE WHEN priority = 'not_urgent' THEN 1 ELSE 0 END) AS not_urgent
      FROM issues
    `);
    res.json({ summary: totals });
  } catch (err) {
    next(err);
  }
}

export async function byDepartment(req, res, next) {
  try {
    const { date_from, date_to } = req.query;
    const params = [...(date_from ? [date_from] : []), ...(date_to ? [date_to] : [])];
    const joinExtra = [
      date_from ? 'AND DATE(i.created_at) >= ?' : '',
      date_to ? 'AND DATE(i.created_at) <= ?' : '',
    ].filter(Boolean).join(' ');
    const rows = await query(
      `SELECT d.name AS department_name, d.id AS department_id,
              COUNT(i.id) AS total,
              SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
              SUM(CASE WHEN i.status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN i.priority = 'urgent' THEN 1 ELSE 0 END) AS urgent
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id
       LEFT JOIN issues i ON i.user_id = u.id ${joinExtra ? joinExtra : ''}
       GROUP BY d.id, d.name ORDER BY total DESC`,
      params
    );
    res.json({ byDepartment: rows });
  } catch (err) {
    next(err);
  }
}

export async function byTechnician(req, res, next) {
  try {
    const { date_from, date_to } = req.query;
    const params = [...(date_from ? [date_from] : []), ...(date_to ? [date_to] : [])];
    const joinExtra = [
      date_from ? 'AND DATE(i.created_at) >= ?' : '',
      date_to ? 'AND DATE(i.created_at) <= ?' : '',
    ].filter(Boolean).join(' ');
    const rows = await query(
      `SELECT u.id, u.full_name, u.email,
              COUNT(i.id) AS total,
              SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
              SUM(CASE WHEN i.status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) AS pending
       FROM users u
       LEFT JOIN issues i ON i.technician_id = u.id ${joinExtra ? joinExtra : ''}
       WHERE u.role = 'technician'
       GROUP BY u.id, u.full_name, u.email ORDER BY total DESC`,
      params
    );
    res.json({ byTechnician: rows });
  } catch (err) {
    next(err);
  }
}

export async function monthly(req, res, next) {
  try {
    const { year } = req.query;
    const y = year || new Date().getFullYear();
    const rows = await query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
             COUNT(*) AS total,
             SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
             SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) AS urgent
      FROM issues
      WHERE YEAR(created_at) = ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `, [y]);
    res.json({ monthly: rows });
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const { date_from, date_to, status, priority, department_id } = req.query;
    let sql = `
      SELECT i.id, i.title, i.description, i.priority, i.status, i.resolution_note, i.user_feedback,
             i.created_at, i.resolved_at,
             u.full_name AS user_name, u.email AS user_email,
             d.name AS department_name,
             t.full_name AS technician_name
      FROM issues i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users t ON i.technician_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (date_from) { sql += ' AND DATE(i.created_at) >= ?'; params.push(date_from); }
    if (date_to) { sql += ' AND DATE(i.created_at) <= ?'; params.push(date_to); }
    if (status) { sql += ' AND i.status = ?'; params.push(status); }
    if (priority) { sql += ' AND i.priority = ?'; params.push(priority); }
    if (department_id) { sql += ' AND u.department_id = ?'; params.push(department_id); }
    sql += ' ORDER BY i.created_at DESC';

    const rows = await query(sql, params);
    const headers = ['id', 'title', 'description', 'priority', 'status', 'resolution_note', 'user_feedback', 'created_at', 'resolved_at', 'user_name', 'user_email', 'department_name', 'technician_name'];
    const escape = (v) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="issues-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
