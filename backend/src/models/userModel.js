import { query, queryOne } from '../config/db.js';

export async function findById(id) {
  return queryOne(
    `SELECT id, full_name, department_id, email, phone, photo, role, status, created_at, updated_at
     FROM users WHERE id = ?`,
    [id]
  );
}

export async function findByEmail(email) {
  return queryOne('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
}

export async function findAll(filters = {}) {
  let sql = `
    SELECT u.id, u.full_name, u.department_id, u.email, u.phone, u.photo, u.role, u.status, u.created_at,
           d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.role) {
    sql += ' AND u.role = ?';
    params.push(filters.role);
  }
  if (filters.department_id) {
    sql += ' AND u.department_id = ?';
    params.push(filters.department_id);
  }
  if (filters.status) {
    sql += ' AND u.status = ?';
    params.push(filters.status);
  }

  sql += ' ORDER BY u.created_at DESC';
  return query(sql, params);
}

export async function findTechnicians() {
  return findAll({ role: 'technician' });
}

export async function findDepartmentUsers(departmentId = null) {
  return findAll({ role: 'department', ...(departmentId && { department_id: departmentId }) });
}

export async function create(data) {
  const { full_name, department_id, email, phone, photo, password, role } = data;
  const result = await query(
    `INSERT INTO users (full_name, department_id, email, phone, photo, password, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    [full_name, department_id || null, email.trim().toLowerCase(), phone || null, photo || null, password, role]
  );
  return result.insertId;
}

export async function update(id, data) {
  const allowed = ['full_name', 'department_id', 'email', 'phone', 'photo', 'password'];
  const updates = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(key === 'password' ? data[key] : data[key]);
    }
  }
  if (updates.length === 0) return null;

  params.push(id);
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  return id;
}

export async function updateStatus(id, status) {
  await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  return id;
}

export async function remove(id) {
  await query('DELETE FROM users WHERE id = ?', [id]);
  return id;
}
