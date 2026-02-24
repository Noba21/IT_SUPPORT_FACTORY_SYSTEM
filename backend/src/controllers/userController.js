import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';

export async function list(req, res, next) {
  try {
    const { role, department_id, status } = req.query;
    const filters = {};
    if (role) filters.role = role;
    if (department_id) filters.department_id = department_id;
    if (status) filters.status = status;

    const users = await userModel.findAll(filters);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getTechnicians(req, res, next) {
  try {
    const technicians = await userModel.findTechnicians();
    res.json({ users: technicians });
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentUsers(req, res, next) {
  try {
    const { department_id } = req.query;
    const users = await userModel.findDepartmentUsers(department_id || null);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { full_name, department_id, email, phone, password, role, location_type } = req.body;
    const photo = req.file ? `profiles/${req.file.filename}` : null;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Full name, email, password and role required' });
    }
    if (!['technician', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be technician or admin' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const loc =
      typeof location_type === 'string' && ['hq', 'factory'].includes(location_type.trim().toLowerCase())
        ? location_type.trim().toLowerCase()
        : null;
    const id = await userModel.create({
      full_name: full_name.trim(),
      department_id: department_id || null,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      location_type: loc,
      photo,
      password: hashed,
      role,
    });

    const user = await userModel.findById(id);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { full_name, department_id, email, phone, password, location_type } = req.body;
    const photo = req.file ? `profiles/${req.file.filename}` : undefined;

    const data = {};
    if (full_name !== undefined) data.full_name = full_name.trim();
    if (department_id !== undefined) data.department_id = department_id || null;
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (photo !== undefined) data.photo = photo;
    if (password && password.length >= 6) data.password = await bcrypt.hash(password, 10);
    if (location_type !== undefined) {
      data.location_type =
        typeof location_type === 'string' && ['hq', 'factory'].includes(location_type.trim().toLowerCase())
          ? location_type.trim().toLowerCase()
          : null;
    }

    if (Object.keys(data).length === 0) {
      const user = await userModel.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    }

    if (email && data.email) {
      const existing = await userModel.findByEmail(data.email);
      if (existing && existing.id !== parseInt(req.params.id)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    await userModel.update(req.params.id, data);
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' });
    }

    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await userModel.updateStatus(req.params.id, status);
    const updated = await userModel.findById(req.params.id);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await userModel.remove(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}
