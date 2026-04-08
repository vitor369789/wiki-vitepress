import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório base das páginas markdown
const docsDir = path.join(__dirname, '../../docs');

// Middleware de autenticação (simplificado - você pode usar o seu próprio)
function requireAuth(req, res, next) {
  const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Listar todas as páginas markdown
router.get('/pages', requireAuth, (req, res) => {
  try {
    const pages = [];
    
    function scanDirectory(dir, basePath = '') {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const relativePath = path.join(basePath, item).replace(/\\/g, '/');
        
        if (stat.isDirectory()) {
          // Ignorar pastas especiais
          if (!item.startsWith('.') && item !== 'node_modules' && item !== 'public') {
            scanDirectory(fullPath, relativePath);
          }
        } else if (item.endsWith('.md')) {
          pages.push({
            path: relativePath,
            name: item,
            size: stat.size,
            modified: stat.mtime
          });
        }
      });
    }
    
    scanDirectory(docsDir);
    
    res.json({ pages });
  } catch (error) {
    console.error('Erro ao listar páginas:', error);
    res.status(500).json({ error: 'Erro ao listar páginas' });
  }
});

// Obter conteúdo de uma página específica
router.get('/pages/:path(*)', requireAuth, (req, res) => {
  try {
    const pagePath = req.params.path;
    const fullPath = path.join(docsDir, pagePath);
    
    // Verificar se o arquivo existe e está dentro do diretório docs
    if (!fullPath.startsWith(docsDir)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stat = fs.statSync(fullPath);
    
    res.json({
      path: pagePath,
      content,
      size: stat.size,
      modified: stat.mtime
    });
  } catch (error) {
    console.error('Erro ao ler página:', error);
    res.status(500).json({ error: 'Erro ao ler página' });
  }
});

// Salvar/criar página
router.post('/pages', requireAuth, (req, res) => {
  try {
    const { path: pagePath, content } = req.body;
    
    if (!pagePath || content === undefined) {
      return res.status(400).json({ error: 'Path e content são obrigatórios' });
    }
    
    const fullPath = path.join(docsDir, pagePath);
    
    // Verificar se o caminho está dentro do diretório docs
    if (!fullPath.startsWith(docsDir)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Criar diretórios se não existirem
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Salvar o arquivo
    fs.writeFileSync(fullPath, content, 'utf-8');
    
    res.json({
      success: true,
      message: 'Página salva com sucesso',
      path: pagePath
    });
  } catch (error) {
    console.error('Erro ao salvar página:', error);
    res.status(500).json({ error: 'Erro ao salvar página' });
  }
});

// Deletar página
router.delete('/pages/:path(*)', requireAuth, (req, res) => {
  try {
    const pagePath = req.params.path;
    const fullPath = path.join(docsDir, pagePath);
    
    // Verificar se o arquivo existe e está dentro do diretório docs
    if (!fullPath.startsWith(docsDir)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }
    
    // Não permitir deletar arquivos importantes
    const fileName = path.basename(fullPath);
    if (fileName === 'index.md' || fileName === 'README.md') {
      return res.status(403).json({ error: 'Não é permitido deletar este arquivo' });
    }
    
    fs.unlinkSync(fullPath);
    
    res.json({
      success: true,
      message: 'Página deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar página:', error);
    res.status(500).json({ error: 'Erro ao deletar página' });
  }
});

export default router;
