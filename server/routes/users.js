import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/init.js';

const router = express.Router();

function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.prepare(`
    SELECT id, email, name, role, active, created_at 
    FROM users 
    ORDER BY created_at DESC
  `).all();

  res.json({ users });
});

router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
  }

  const validRoles = ['guest', 'user', 'admin'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role inválido' });
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (?, ?, ?, ?)
  `).run(email, hashedPassword, name, role || 'user');

  res.status(201).json({
    success: true,
    user: {
      id: result.lastInsertRowid,
      email,
      name,
      role: role || 'user'
    }
  });
});

router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { email, name, role, active } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const updates = [];
  const values = [];

  if (email) {
    updates.push('email = ?');
    values.push(email);
  }
  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (role) {
    updates.push('role = ?');
    values.push(role);
  }
  if (active !== undefined) {
    updates.push('active = ?');
    values.push(active ? 1 : 0);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.prepare(`
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = ?
  `).run(...values);

  res.json({ success: true, message: 'Usuário atualizado' });
});

router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
  }

  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({ success: true, message: 'Usuário deletado' });
});

router.get('/permissions', authMiddleware, adminMiddleware, (req, res) => {
  const permissions = db.prepare(`
    SELECT * FROM permissions 
    ORDER BY role, page
  `).all();

  res.json({ permissions });
});

router.post('/permissions', authMiddleware, adminMiddleware, (req, res) => {
  const { role, page, can_access } = req.body;

  if (!role || !page) {
    return res.status(400).json({ error: 'Role e page são obrigatórios' });
  }

  db.prepare(`
    INSERT OR REPLACE INTO permissions (role, page, can_access)
    VALUES (?, ?, ?)
  `).run(role, page, can_access ? 1 : 0);

  res.json({ success: true, message: 'Permissão atualizada' });
});

export default router;
