import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import filesRoutes from './routes/files.js';
import foldersRoutes from './routes/folders.js';
import secureFilesRoutes from './routes/secure-files.js';
import { initDatabase } from './database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: function(origin, callback) {
    // Em produção, permitir o domínio configurado
    if (process.env.NODE_ENV === 'production') {
      // Permitir requisições sem origin (mesma origem)
      if (!origin) return callback(null, true);
      
      // Permitir o domínio de produção da variável de ambiente
      const productionUrl = process.env.FRONTEND_URL || '';
      if (origin === productionUrl || origin.includes('easypanel.host')) {
        return callback(null, true);
      }
    }
    
    // Em desenvolvimento, permitir localhost
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:7274',
      'http://localhost:7274'
    ];
    
    // Permitir requisições sem origin (como Postman, curl, etc)
    if (!origin) return callback(null, true);
    
    // Permitir qualquer origin que comece com http://127.0.0.1 ou http://localhost
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos em produção por enquanto
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

initDatabase();

// Rotas de arquivos protegidos ANTES das outras rotas
app.use('/secure', secureFilesRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', filesRoutes);
app.use('/api', foldersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Servir arquivos estáticos do VitePress em produção
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../docs/.vitepress/dist');
  app.use(express.static(distPath));
  
  // SPA fallback - redirecionar todas as rotas não-API para index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📚 Wiki serving static files from production build`);
  } else {
    console.log(`📚 Wiki dev server should run on http://localhost:5173`);
  }
});
