import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, query } from '../config/db.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sendToken(res, user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment');
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, location_type: user.location_type || null },
    secret,
    { expiresIn: JWT_EXPIRES_IN }
  );
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      photo: user.photo,
      status: user.status,
      location_type: user.location_type || null,
    },
  });
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await queryOne(
      'SELECT id, full_name, email, password, role, department_id, photo, status, location_type FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    sendToken(res, user);
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { full_name, department_id, email, phone, password, location_type } = req.body;
    const photo = req.file ? `profiles/${req.file.filename}` : null;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password required' });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const loc =
      typeof location_type === 'string' && ['hq', 'factory'].includes(location_type.trim().toLowerCase())
        ? location_type.trim().toLowerCase()
        : null;
    const result = await query(
      `INSERT INTO users (full_name, department_id, email, phone, location_type, photo, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'department', 'active')`,
      [full_name.trim(), department_id || null, email.trim().toLowerCase(), phone?.trim() || null, loc, photo, hashed]
    );

    const user = await queryOne(
      'SELECT id, full_name, email, role, department_id, photo, status, location_type FROM users WHERE id = ?',
      [result.insertId]
    );
    sendToken(res, user);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await queryOne(
      `SELECT id, full_name, email, phone, photo, role, department_id, status, created_at, location_type
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
