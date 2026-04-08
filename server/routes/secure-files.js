import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';
import db from '../database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../docs/public/uploads');

// Middleware para verificar acesso ao arquivo
function checkFileAccess(req, res, next) {
  let token = req.cookies.auth_token;
  
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }
  
  // Aceitar token via query string (para tags <img>)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // Se não tem token, é guest
  let userRole = 'guest';
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.prepare('SELECT role FROM users WHERE id = ? AND active = 1').get(decoded.id);
      if (user) {
        userRole = user.role;
      }
    } catch (error) {
      // Token inválido, continua como guest
    }
  }

  // Verificar permissão para acessar arquivos
  // Por padrão, apenas usuários autenticados podem ver arquivos
  const canAccess = userRole !== 'guest';

  if (!canAccess) {
    return res.status(403).json({ 
      error: 'Acesso negado. Faça login para visualizar este arquivo.' 
    });
  }

  req.userRole = userRole;
  next();
}

// Servir arquivo protegido (suporta pastas)
router.get('/uploads/:path(*)', checkFileAccess, (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.path);

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Prevenir path traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Enviar arquivo
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Erro ao servir arquivo' });
  }
});

export default router;
