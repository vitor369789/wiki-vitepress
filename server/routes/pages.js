import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório base das páginas markdown
const docsDir = path.join(__dirname, '../../docs');

// Status do rebuild
let rebuildStatus = {
  isRebuilding: false,
  lastRebuild: null,
  lastError: null
};

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
    console.log('📂 Diretório docs:', docsDir);
    console.log('📂 Diretório existe?', fs.existsSync(docsDir));
    
    if (!fs.existsSync(docsDir)) {
      console.error('❌ Diretório docs não encontrado!');
      return res.json({ pages: [], error: 'Diretório não encontrado' });
    }
    
    const pages = [];
    
    function scanDirectory(dir, basePath = '') {
      console.log('🔍 Escaneando:', dir);
      const items = fs.readdirSync(dir);
      console.log('📄 Itens encontrados:', items.length);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const relativePath = path.join(basePath, item).replace(/\\/g, '/');
        
        if (stat.isDirectory()) {
          // Ignorar pastas especiais
          if (!item.startsWith('.') && item !== 'node_modules' && item !== 'public') {
            console.log('📁 Entrando em pasta:', item);
            scanDirectory(fullPath, relativePath);
          }
        } else if (item.endsWith('.md')) {
          console.log('📄 Arquivo .md encontrado:', relativePath);
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
    
    console.log('✅ Total de páginas encontradas:', pages.length);
    res.json({ pages });
  } catch (error) {
    console.error('❌ Erro ao listar páginas:', error);
    res.status(500).json({ error: 'Erro ao listar páginas', message: error.message });
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
    
    console.log('💾 Salvando página:', pagePath);
    console.log('📝 Tamanho do conteúdo:', content?.length || 0, 'caracteres');
    
    if (!pagePath || content === undefined) {
      console.error('❌ Path ou content ausente');
      return res.status(400).json({ error: 'Path e content são obrigatórios' });
    }
    
    const fullPath = path.join(docsDir, pagePath);
    console.log('📂 Caminho completo:', fullPath);
    
    // Verificar se o caminho está dentro do diretório docs
    if (!fullPath.startsWith(docsDir)) {
      console.error('❌ Acesso negado - fora do diretório docs');
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Criar diretórios se não existirem
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      console.log('📁 Criando diretório:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Salvar o arquivo
    console.log('💾 Escrevendo arquivo...');
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('✅ Arquivo salvo com sucesso!');
    
    // Rebuild do VitePress em background
    if (process.env.NODE_ENV === 'production') {
      const projectRoot = path.join(docsDir, '..');
      
      if (!rebuildStatus.isRebuilding) {
        rebuildStatus.isRebuilding = true;
        console.log('🔨 Iniciando rebuild do VitePress...');
        
        execAsync('npm run docs:build', { cwd: projectRoot })
          .then(() => {
            console.log('✅ Rebuild do VitePress concluído!');
            rebuildStatus.isRebuilding = false;
            rebuildStatus.lastRebuild = new Date();
            rebuildStatus.lastError = null;
          })
          .catch((error) => {
            console.error('❌ Erro no rebuild:', error.message);
            rebuildStatus.isRebuilding = false;
            rebuildStatus.lastError = error.message;
          });
      } else {
        console.log('⏳ Rebuild já em andamento, aguardando...');
      }
    }
    
    res.json({
      success: true,
      message: 'Página salva com sucesso. O site será atualizado em alguns segundos.',
      path: pagePath
    });
  } catch (error) {
    console.error('Erro ao salvar página:', error);
    res.status(500).json({ error: 'Erro ao salvar página' });
  }
});

// Status do rebuild
router.get('/rebuild-status', requireAuth, (req, res) => {
  res.json(rebuildStatus);
});

// Trigger rebuild manual
router.post('/rebuild', requireAuth, (req, res) => {
  if (rebuildStatus.isRebuilding) {
    return res.json({ 
      success: false, 
      message: 'Rebuild já em andamento',
      status: rebuildStatus 
    });
  }

  const projectRoot = path.join(docsDir, '..');
  rebuildStatus.isRebuilding = true;
  
  console.log('🔨 Rebuild manual iniciado...');
  
  execAsync('npm run docs:build', { cwd: projectRoot })
    .then(() => {
      console.log('✅ Rebuild manual concluído!');
      rebuildStatus.isRebuilding = false;
      rebuildStatus.lastRebuild = new Date();
      rebuildStatus.lastError = null;
    })
    .catch((error) => {
      console.error('❌ Erro no rebuild manual:', error.message);
      rebuildStatus.isRebuilding = false;
      rebuildStatus.lastError = error.message;
    });

  res.json({ 
    success: true, 
    message: 'Rebuild iniciado! Aguarde 30-60 segundos.',
    status: rebuildStatus 
  });
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
