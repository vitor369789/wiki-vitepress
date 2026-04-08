import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../docs/public/uploads');

// Middleware de autenticação
function authMiddleware(req, res, next) {
  let token = req.cookies.auth_token;
  
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }

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

// Criar pasta
router.post('/folders', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da pasta é obrigatório' });
    }

    // Validar nome da pasta
    if (!/^[a-zA-Z0-9\-_]+$/.test(name)) {
      return res.status(400).json({ 
        error: 'Nome inválido. Use apenas letras, números, hífens e underscores.' 
      });
    }

    const folderPath = parent 
      ? path.join(uploadsDir, parent, name)
      : path.join(uploadsDir, name);

    // Verificar se já existe
    if (fs.existsSync(folderPath)) {
      return res.status(400).json({ error: 'Pasta já existe' });
    }

    // Criar pasta
    fs.mkdirSync(folderPath, { recursive: true });

    const relativePath = parent ? `${parent}/${name}` : name;

    res.json({
      success: true,
      folder: {
        name,
        path: relativePath
      }
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Erro ao criar pasta' });
  }
});

// Deletar pasta
router.delete('/folders/:path(*)', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const folderPath = path.join(uploadsDir, req.params.path);

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }

    // Verificar se é uma pasta
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Não é uma pasta' });
    }

    // Verificar se está vazia
    const contents = fs.readdirSync(folderPath);
    if (contents.length > 0) {
      return res.status(400).json({ 
        error: 'Pasta não está vazia. Delete os arquivos primeiro.' 
      });
    }

    // Deletar pasta
    fs.rmdirSync(folderPath);

    res.json({ success: true, message: 'Pasta deletada' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Erro ao deletar pasta' });
  }
});

// Renomear pasta
router.put('/folders/:path(*)', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { newName } = req.body;
    const oldPath = path.join(uploadsDir, req.params.path);

    if (!newName) {
      return res.status(400).json({ error: 'Novo nome é obrigatório' });
    }

    // Validar nome
    if (!/^[a-zA-Z0-9\-_]+$/.test(newName)) {
      return res.status(400).json({ 
        error: 'Nome inválido. Use apenas letras, números, hífens e underscores.' 
      });
    }

    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }

    const parentDir = path.dirname(oldPath);
    const newPath = path.join(parentDir, newName);

    if (fs.existsSync(newPath)) {
      return res.status(400).json({ error: 'Já existe uma pasta com este nome' });
    }

    // Renomear
    fs.renameSync(oldPath, newPath);

    res.json({ success: true, message: 'Pasta renomeada' });
  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).json({ error: 'Erro ao renomear pasta' });
  }
});

export default router;
