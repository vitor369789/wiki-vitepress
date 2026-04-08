import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsPath = path.join(__dirname, '../docs');
const backupPath = path.join(__dirname, '../docs-backup');
const distPath = path.join(docsPath, '.vitepress/dist');

console.log('🔍 Verificando volume...');
console.log('📂 Docs path:', docsPath);
console.log('📂 Backup path:', backupPath);
console.log('📂 Dist path:', distPath);

// Verificar conteúdo do dist
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath);
  console.log('📄 Arquivos em dist:', distFiles.length);
  
  // Verificar se admin/index.html existe (indica build completo)
  const adminIndexPath = path.join(distPath, 'admin', 'index.html');
  const hasAdminPage = fs.existsSync(adminIndexPath);
  console.log('🔍 Página admin existe?', hasAdminPage);
  
  if (!hasAdminPage && distFiles.length > 0) {
    console.log('⚠️ Build incompleto detectado! Dist tem arquivos mas falta admin page.');
  }
} else {
  console.log('❌ Diretório dist não existe!');
}

// Verificar se o volume está vazio ou sem build completo
const needsInit = !fs.existsSync(distPath) || 
                  fs.readdirSync(distPath).length === 0 ||
                  !fs.existsSync(path.join(distPath, 'admin', 'index.html'));

if (needsInit) {
  console.log('📦 Volume vazio ou sem build detectado!');
  
  if (fs.existsSync(backupPath)) {
    console.log('📋 Copiando arquivos do backup para o volume...');
    
    try {
      // Função recursiva para copiar diretório
      function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDir(backupPath, docsPath);
      console.log('✅ Volume inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao copiar arquivos:', error);
    }
  } else {
    console.log('⚠️ Backup não encontrado em:', backupPath);
  }
} else {
  console.log('✅ Volume já inicializado!');
}

console.log('🚀 Iniciando servidor...');
