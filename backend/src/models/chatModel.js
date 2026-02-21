import { query, queryOne } from '../config/db.js';

export async function findByIssueId(issueId) {
  return queryOne('SELECT id, issue_id, created_at FROM chats WHERE issue_id = ?', [issueId]);
}

export async function createForIssue(issueId) {
  const result = await query('INSERT INTO chats (issue_id) VALUES (?)', [issueId]);
  return result.insertId;
}
