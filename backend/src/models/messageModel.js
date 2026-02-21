import { query, queryOne } from '../config/db.js';

export async function findByChatId(chatId) {
  return query(
    `SELECT m.id, m.chat_id, m.user_id, m.content, m.created_at, u.full_name, u.role
     FROM messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.chat_id = ?
     ORDER BY m.created_at ASC`,
    [chatId]
  );
}

export async function create(chatId, userId, content) {
  const result = await query(
    'INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)',
    [chatId, userId, content]
  );
  return result.insertId;
}

export async function findById(id) {
  return queryOne(
    `SELECT m.*, u.full_name, u.role FROM messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.id = ?`,
    [id]
  );
}
