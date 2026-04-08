# 🔐 Sistema de Autenticação - Guia Completo

Sistema de autenticação com controle de acesso por páginas implementado com sucesso!

## 📋 Estrutura do Sistema

### Backend (Node.js + Express)
- **Servidor**: `server/index.js` - Porta 3000
- **Banco de dados**: SQLite (`server/database/database.db`)
- **Autenticação**: JWT (JSON Web Tokens)
- **Rotas**:
  - `/api/auth/*` - Login, logout, verificação
  - `/api/users/*` - Gerenciamento de usuários (admin)

### Frontend (VitePress + Vue)
- **Componentes**:
  - `AuthGuard.vue` - Proteção de rotas
  - `LoginModal.vue` - Modal de login
  - `UserMenu.vue` - Menu do usuário

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
PORT=3000
JWT_SECRET=sua_chave_secreta_super_segura_mude_isso
JWT_EXPIRES_IN=24h

ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=admin123
```

⚠️ **IMPORTANTE**: Altere o `JWT_SECRET` para uma chave segura em produção!

### 3. Iniciar o Sistema

```bash
# Iniciar backend + frontend juntos
npm run dev

# OU iniciar separadamente:

# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run docs:dev
```

### 4. Acessar

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 👥 Usuários Padrão

### Administrador
- **Email**: admin@exemplo.com
- **Senha**: admin123
- **Permissões**: Acesso total a todas as páginas

### Guest (Visitante)
- **Acesso**: Sem login
- **Permissões**: Apenas Home e FAQ

## 🔑 Níveis de Acesso (Roles)

### 1. Guest (Visitante)
- ✅ Home (`/`)
- ✅ FAQ (`/faq`)
- ❌ Documentação (`/documentacao/`)
- ❌ API (`/api/`)

### 2. User (Usuário)
- ✅ Home (`/`)
- ✅ FAQ (`/faq`)
- ✅ Documentação (`/documentacao/`)
- ❌ API (`/api/`)

### 3. Admin (Administrador)
- ✅ Acesso total a todas as páginas
- ✅ Gerenciamento de usuários
- ✅ Configuração de permissões

## 🛠️ Gerenciar Usuários

### Criar Novo Usuário (via API)

```bash
# Login como admin primeiro
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"admin123"}' \
  -c cookies.txt

# Criar usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "email":"usuario@exemplo.com",
    "password":"senha123",
    "name":"Novo Usuário",
    "role":"user"
  }'
```

### Listar Usuários

```bash
curl http://localhost:3000/api/users \
  -b cookies.txt
```

### Atualizar Usuário

```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name":"Nome Atualizado",
    "role":"admin"
  }'
```

### Deletar Usuário

```bash
curl -X DELETE http://localhost:3000/api/users/2 \
  -b cookies.txt
```

## 🔒 Configurar Permissões

### Estrutura de Permissões

As permissões são armazenadas na tabela `permissions`:

```sql
role    | page              | can_access
--------|-------------------|------------
guest   | /                 | 1
guest   | /faq              | 1
guest   | /documentacao/    | 0
user    | /documentacao/    | 1
admin   | /api/             | 1
```

### Adicionar/Atualizar Permissão

```bash
curl -X POST http://localhost:3000/api/users/permissions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "role":"user",
    "page":"/api/",
    "can_access":true
  }'
```

### Listar Permissões

```bash
curl http://localhost:3000/api/users/permissions \
  -b cookies.txt
```

## 📄 Adicionar Proteção em Novas Páginas

### Opção 1: Automática (Recomendado)

O sistema já protege automaticamente todas as páginas baseado nas permissões configuradas no banco de dados.

### Opção 2: Manual (Componente)

Se quiser proteção customizada em uma página específica:

```vue
<script setup>
import AuthGuard from './.vitepress/theme/components/AuthGuard.vue'
</script>

<AuthGuard>

# Conteúdo Protegido

Este conteúdo só será visível para usuários autorizados.

</AuthGuard>
```

## 🗄️ Banco de Dados

### Localização
`server/database/database.db`

### Tabelas

#### users
```sql
id, email, password, name, role, active, created_at, updated_at
```

#### permissions
```sql
id, role, page, can_access
```

#### sessions
```sql
id, user_id, token, expires_at, created_at
```

### Acessar o Banco (SQLite)

```bash
# Instalar sqlite3 (se necessário)
npm install -g sqlite3

# Abrir banco
sqlite3 server/database/database.db

# Comandos úteis
.tables                          # Listar tabelas
SELECT * FROM users;             # Ver usuários
SELECT * FROM permissions;       # Ver permissões
.quit                           # Sair
```

## 🔧 Personalização

### Alterar Páginas Protegidas

Edite `server/database/init.js` na seção `defaultPermissions`:

```javascript
const defaultPermissions = [
  { role: 'guest', page: '/sua-pagina', can_access: 0 },
  { role: 'user', page: '/sua-pagina', can_access: 1 },
  // ...
];
```

### Adicionar Novo Role

1. Crie usuário com novo role
2. Configure permissões para o novo role
3. Atualize labels em `UserMenu.vue` se necessário

### Customizar Tempo de Sessão

Edite `.env`:

```env
JWT_EXPIRES_IN=7d    # 7 dias
JWT_EXPIRES_IN=12h   # 12 horas
JWT_EXPIRES_IN=30m   # 30 minutos
```

## 🚨 Segurança

### Checklist de Segurança

- [ ] Alterar `JWT_SECRET` para valor único e seguro
- [ ] Alterar senha do admin padrão
- [ ] Usar HTTPS em produção
- [ ] Configurar CORS adequadamente
- [ ] Implementar rate limiting (recomendado)
- [ ] Fazer backup regular do banco de dados
- [ ] Não commitar arquivo `.env`

### Boas Práticas

1. **Senhas**: Mínimo 8 caracteres, use bcrypt (já implementado)
2. **Tokens**: JWT com expiração configurada
3. **Cookies**: HttpOnly, Secure em produção
4. **CORS**: Configurado apenas para localhost em dev

## 📊 Endpoints da API

### Autenticação

```bash
POST   /api/auth/login          # Login
POST   /api/auth/logout         # Logout
GET    /api/auth/me             # Usuário atual
POST   /api/auth/check-access   # Verificar acesso a página
```

### Usuários (Admin apenas)

```bash
GET    /api/users               # Listar usuários
POST   /api/users               # Criar usuário
PUT    /api/users/:id           # Atualizar usuário
DELETE /api/users/:id           # Deletar usuário
GET    /api/users/permissions   # Listar permissões
POST   /api/users/permissions   # Atualizar permissão
```

### Health Check

```bash
GET    /api/health              # Status do servidor
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
npm install
```

### Erro: "EADDRINUSE: address already in use"

Porta 3000 ou 5173 já está em uso:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Erro: "Database locked"

Feche todas as conexões com o banco:

```bash
rm server/database/database.db
npm run server  # Recria o banco
```

### Login não funciona

1. Verifique se o backend está rodando (porta 3000)
2. Verifique console do navegador (F12)
3. Teste endpoint diretamente:

```bash
curl http://localhost:3000/api/health
```

### Permissões não aplicam

1. Verifique banco de dados:

```bash
sqlite3 server/database/database.db "SELECT * FROM permissions;"
```

2. Limpe cookies do navegador
3. Faça logout e login novamente

## 📚 Próximos Passos

### Melhorias Sugeridas

1. **Interface de Admin**
   - Criar painel para gerenciar usuários
   - Interface para configurar permissões

2. **Recuperação de Senha**
   - Implementar "Esqueci minha senha"
   - Envio de email

3. **2FA (Two-Factor Authentication)**
   - Autenticação de dois fatores
   - Códigos por email/SMS

4. **Auditoria**
   - Log de acessos
   - Histórico de alterações

5. **Rate Limiting**
   - Limitar tentativas de login
   - Proteção contra brute force

## 📞 Suporte

Problemas ou dúvidas? Verifique:

1. Logs do servidor (terminal onde rodou `npm run server`)
2. Console do navegador (F12 > Console)
3. Arquivo de banco de dados existe?
4. Variáveis de ambiente configuradas?

---

**Sistema implementado com sucesso! 🎉**

Para testar:
1. Acesse http://localhost:5173
2. Tente acessar /documentacao/ (será bloqueado)
3. Faça login com admin@exemplo.com / admin123
4. Agora você tem acesso total!
