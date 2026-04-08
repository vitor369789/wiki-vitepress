import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/init.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  db.prepare(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(user.id, token, expiresAt.toISOString());

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  });
});

router.post('/logout', (req, res) => {
  const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

router.get('/me', (req, res) => {
  let token = req.cookies.auth_token;
  
  // Verificar header Authorization
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ? AND active = 1').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

router.post('/check-access', (req, res) => {
  const { page } = req.body;
  let token = req.cookies.auth_token;
  
  // Verificar header Authorization
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }

  let role = 'guest';

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.prepare('SELECT role FROM users WHERE id = ? AND active = 1').get(decoded.id);
      if (user) {
        role = user.role;
      }
    } catch (error) {
    }
  }

  let permission = db.prepare(`
    SELECT can_access FROM permissions 
    WHERE role = ? AND page = ?
  `).get(role, page);

  if (!permission) {
    const pathParts = page.split('/').filter(p => p);
    if (pathParts.length > 0) {
      const basePath = '/' + pathParts[0] + '/';
      permission = db.prepare(`
        SELECT can_access FROM permissions 
        WHERE role = ? AND page = ?
      `).get(role, basePath);
    }
  }

  const canAccess = permission ? permission.can_access === 1 : (role === 'admin');

  res.json({
    canAccess,
    role,
    page
  });
});

export default router;
