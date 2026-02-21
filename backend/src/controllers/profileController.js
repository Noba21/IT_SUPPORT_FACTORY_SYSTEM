import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';

export async function updateMe(req, res, next) {
  try {
    const { full_name, phone, email, password, current_password } = req.body;
    const photo = req.file ? `profiles/${req.file.filename}` : undefined;

    const data = {};
    if (full_name !== undefined) data.full_name = full_name.trim();
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (photo !== undefined) data.photo = photo;
    if (password && password.length >= 6) data.password = await bcrypt.hash(password, 10);

    const changingSensitive = (phone !== undefined) || (email !== undefined && email.trim()) || (password && password.length >= 6);
    if (changingSensitive) {
      if (!current_password || !current_password.trim()) {
        return res.status(400).json({ error: 'Current password is required to change phone, email or password' });
      }
      const existing = await userModel.findByIdWithPassword(req.user.id);
      if (!existing) return res.status(404).json({ error: 'User not found' });
      const match = await bcrypt.compare(current_password.trim(), existing.password);
      if (!match) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    if (data.email !== undefined) {
      const other = await userModel.findByEmail(data.email);
      if (other && other.id !== req.user.id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    if (Object.keys(data).length === 0) {
      const user = await userModel.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    }

    await userModel.update(req.user.id, data);
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
