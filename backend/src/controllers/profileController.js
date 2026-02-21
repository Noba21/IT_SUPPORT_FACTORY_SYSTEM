import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';

export async function updateMe(req, res, next) {
  try {
    const { full_name, phone, password } = req.body;
    const photo = req.file ? `profiles/${req.file.filename}` : undefined;

    const data = {};
    if (full_name !== undefined) data.full_name = full_name.trim();
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (photo !== undefined) data.photo = photo;
    if (password && password.length >= 6) data.password = await bcrypt.hash(password, 10);

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
