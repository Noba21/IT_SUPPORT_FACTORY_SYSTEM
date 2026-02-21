import * as departmentModel from '../models/departmentModel.js';

export async function list(req, res, next) {
  try {
    const departments = await departmentModel.findAll();
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const department = await departmentModel.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json({ department });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name required' });
    }

    const id = await departmentModel.create({ name: name.trim(), description: description?.trim() });
    const department = await departmentModel.findById(id);
    res.status(201).json({ department });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, description } = req.body;
    const department = await departmentModel.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });

    await departmentModel.update(req.params.id, {
      name: name !== undefined ? name.trim() : department.name,
      description: description !== undefined ? description?.trim() : department.description,
    });
    const updated = await departmentModel.findById(req.params.id);
    res.json({ department: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const department = await departmentModel.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });

    await departmentModel.remove(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
}
