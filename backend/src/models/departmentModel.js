import { query, queryOne } from '../config/db.js';

export async function findAll() {
  return query('SELECT id, name, description, created_at FROM departments ORDER BY name');
}

export async function findById(id) {
  return queryOne('SELECT id, name, description, created_at FROM departments WHERE id = ?', [id]);
}

export async function create(data) {
  const { name, description } = data;
  const result = await query(
    'INSERT INTO departments (name, description) VALUES (?, ?)',
    [name.trim(), description?.trim() || null]
  );
  return result.insertId;
}

export async function update(id, data) {
  const { name, description } = data;
  await query(
    'UPDATE departments SET name = ?, description = ? WHERE id = ?',
    [name?.trim(), description?.trim() || null, id]
  );
  return id;
}

export async function remove(id) {
  await query('DELETE FROM departments WHERE id = ?', [id]);
  return id;
}
