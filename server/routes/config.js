import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../../docs/.vitepress/config.mts');

// Middleware de autenticação
function requireAuth(req, res, next) {
  const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Ler configuração
router.get('/config', requireAuth, (req, res) => {
  try {
    console.log('📖 Lendo config.mts...');
    
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: 'Arquivo de configuração não encontrado' });
    }
    
    const content = fs.readFileSync(configPath, 'utf-8');
    
    res.json({
      content,
      path: 'docs/.vitepress/config.mts'
    });
  } catch (error) {
    console.error('❌ Erro ao ler config:', error);
    res.status(500).json({ error: 'Erro ao ler configuração' });
  }
});

// Salvar configuração
router.post('/config', requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('💾 Salvando config.mts...');
    
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }
    
    // Fazer backup antes de salvar
    const backupPath = configPath + '.backup';
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
      console.log('📦 Backup criado:', backupPath);
    }
    
    // Salvar novo conteúdo
    fs.writeFileSync(configPath, content, 'utf-8');
    console.log('✅ Config salvo com sucesso!');
    
    res.json({
      success: true,
      message: 'Configuração salva! Faça rebuild para aplicar as mudanças.'
    });
  } catch (error) {
    console.error('❌ Erro ao salvar config:', error);
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
});

export default router;
