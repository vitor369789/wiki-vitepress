import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configurar diretórios
const uploadsDir = path.join(__dirname, '../../docs/public/uploads');
const pagesDir = path.join(__dirname, '../../docs');

// Criar diretório de uploads se não existir
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pegar pasta do body (se fornecida)
    const folder = req.body.folder || '';
    console.log('📁 Backend - req.body.folder:', req.body.folder);
    console.log('📂 Backend - folder usado:', folder);
    const targetDir = path.join(uploadsDir, folder);
    console.log('📍 Backend - targetDir:', targetDir);
    
    // Criar pasta se não existir
    if (!fs.existsSync(targetDir)) {
      console.log('✅ Criando pasta:', targetDir);
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|pdf|doc|docx|xls|xlsx|zip|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Upload de arquivo
router.post('/upload', authMiddleware, adminMiddleware, (req, res) => {
  // Pegar folder do query parameter
  const folder = req.query.folder || '';
  console.log('📁 Backend - req.query.folder:', req.query.folder);
  console.log('📂 Backend - folder usado:', folder);
  
  // Criar upload dinâmico baseado no folder
  const uploadDynamic = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const targetDir = path.join(uploadsDir, folder);
        console.log('📍 Backend - targetDir:', targetDir);
        
        if (!fs.existsSync(targetDir)) {
          console.log('✅ Criando pasta:', targetDir);
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        cb(null, targetDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, name + '-' + uniqueSuffix + ext);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  }).single('file');

  uploadDynamic(req, res, (err) => {
    if (err) {
      console.error('❌ Erro no upload:', err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const filePath = folder ? `${folder}/${req.file.filename}` : req.file.filename;

    console.log('✅ Upload completo - arquivo salvo em:', filePath);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        folder: folder,
        path: filePath,
        url: `/secure/uploads/${filePath}`,
        publicUrl: `/uploads/${filePath}`
      }
    });
  });
});

// Função recursiva para listar arquivos e pastas
function listFilesRecursive(dir, baseDir = '') {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // Adicionar pasta
      items.push({
        type: 'folder',
        name: entry.name,
        path: relativePath,
        children: listFilesRecursive(fullPath, relativePath)
      });
    } else {
      // Adicionar arquivo
      const stats = fs.statSync(fullPath);
      items.push({
        type: 'file',
        filename: entry.name,
        path: relativePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/secure/uploads/${relativePath}`,
        publicUrl: `/uploads/${relativePath}`
      });
    }
  }

  return items;
}

// Listar arquivos e pastas
router.get('/files', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const items = listFilesRecursive(uploadsDir);
    res.json({ items });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Deletar arquivo
router.delete('/files/:filename', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Arquivo deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

// Listar páginas
router.get('/pages', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const pages = [];

    function scanDir(dir, baseDir = '') {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(baseDir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && !item.startsWith('.') && item !== 'public') {
          scanDir(fullPath, relativePath);
        } else if (item.endsWith('.md')) {
          pages.push({
            path: relativePath.replace(/\\/g, '/'),
            name: item,
            size: stats.size,
            modified: stats.mtime
          });
        }
      });
    }

    scanDir(pagesDir);
    res.json({ pages });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar páginas' });
  }
});

// Ler conteúdo de uma página
router.get('/pages/:path(*)', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const pagePath = path.join(pagesDir, req.params.path);

    if (!fs.existsSync(pagePath)) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    const content = fs.readFileSync(pagePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler página' });
  }
});

// Criar/Atualizar página
router.post('/pages', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { path: pagePath, content } = req.body;

    if (!pagePath || !content) {
      return res.status(400).json({ error: 'Path e conteúdo são obrigatórios' });
    }

    const fullPath = path.join(pagesDir, pagePath);
    const dir = path.dirname(fullPath);

    // Criar diretório se não existir
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');

    res.json({
      success: true,
      message: 'Página salva com sucesso',
      path: pagePath
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar página' });
  }
});

// Deletar página
router.delete('/pages/:path(*)', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const pagePath = path.join(pagesDir, req.params.path);

    if (!fs.existsSync(pagePath)) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    fs.unlinkSync(pagePath);
    res.json({ success: true, message: 'Página deletada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar página' });
  }
});

export default router;
