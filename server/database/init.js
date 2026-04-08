import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar diretório de dados persistente
const dataDir = join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'database.db');
console.log('📊 Database path:', dbPath);

const db = new Database(dbPath);

export function initDatabase() {
  try {
    console.log('🔧 Inicializando banco de dados...');
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      page TEXT NOT NULL,
      can_access INTEGER DEFAULT 1,
      UNIQUE(role, page)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run(adminEmail, hashedPassword, 'Administrador', 'admin');

    console.log('✅ Admin user created:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Change the password after first login!');
  }

  const guestUser = db.prepare('SELECT * FROM users WHERE email = ?').get('guest@exemplo.com');
  if (!guestUser) {
    db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run('guest@exemplo.com', '', 'Visitante', 'guest');
  }

  const defaultPermissions = [
    { role: 'guest', page: '/', can_access: 1 },
    { role: 'guest', page: '/faq', can_access: 1 },
    { role: 'guest', page: '/documentacao/', can_access: 0 },
    { role: 'guest', page: '/api/', can_access: 0 },
    { role: 'guest', page: '/admin/', can_access: 0 },
    
    { role: 'user', page: '/', can_access: 1 },
    { role: 'user', page: '/faq', can_access: 1 },
    { role: 'user', page: '/documentacao/', can_access: 1 },
    { role: 'user', page: '/api/', can_access: 0 },
    { role: 'user', page: '/admin/', can_access: 0 },
    
    { role: 'admin', page: '/', can_access: 1 },
    { role: 'admin', page: '/faq', can_access: 1 },
    { role: 'admin', page: '/documentacao/', can_access: 1 },
    { role: 'admin', page: '/api/', can_access: 1 },
    { role: 'admin', page: '/admin/', can_access: 1 },
  ];

  const insertPermission = db.prepare(`
    INSERT OR IGNORE INTO permissions (role, page, can_access)
    VALUES (?, ?, ?)
  `);

    for (const perm of defaultPermissions) {
      insertPermission.run(perm.role, perm.page, perm.can_access);
    }

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

export default db;
