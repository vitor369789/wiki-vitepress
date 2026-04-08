# 🚀 Deploy no Easypanel - Wiki VitePress

Guia completo para fazer deploy da sua wiki no Easypanel.

## 📋 Pré-requisitos

- Conta no Easypanel
- Repositório Git (GitHub, GitLab, etc.)
- Domínio configurado (opcional)

## 🔧 Preparação do Projeto

### 1. Variáveis de Ambiente

No Easypanel, configure as seguintes variáveis de ambiente:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=seu-secret-super-seguro-aqui-min-32-caracteres
```

**⚠️ IMPORTANTE:** Gere um JWT_SECRET forte:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Estrutura do Projeto

Certifique-se de que seu projeto tem:
- ✅ `package.json` com scripts de build
- ✅ `server/index.js` (servidor Express)
- ✅ `docs/` (conteúdo VitePress)
- ✅ `.gitignore` configurado

## 📦 Configuração no Easypanel

### Passo 1: Criar Novo App

1. Acesse seu painel Easypanel
2. Clique em **"Create App"**
3. Escolha **"From Source Code"**

### Passo 2: Conectar Repositório

1. Conecte seu repositório Git
2. Selecione a branch (geralmente `main` ou `master`)
3. Easypanel detectará automaticamente que é um projeto Node.js

### Passo 3: Configurar Build

**Build Command:**
```bash
npm ci && npm run docs:build
```

**Start Command:**
```bash
node server/index.js
```

**Port:**
```
3000
```

### Passo 4: Variáveis de Ambiente

Adicione as variáveis de ambiente:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `3000` | Porta do servidor |
| `JWT_SECRET` | `[seu-secret]` | Secret para JWT (32+ caracteres) |

### Passo 5: Volumes Persistentes

Configure volumes para dados persistentes:

**Volume 1: Uploads**
- **Mount Path:** `/app/docs/public/uploads`
- **Size:** 5GB (ou conforme necessário)

**Volume 2: Database**
- **Mount Path:** `/app/server/database/data`
- **Size:** 1GB

### Passo 6: Domínio

1. Vá para **"Domains"**
2. Adicione seu domínio personalizado
3. Easypanel configurará SSL automaticamente

## 🔨 Scripts Necessários no package.json

Verifique se seu `package.json` tem estes scripts:

```json
{
  "scripts": {
    "docs:build": "vitepress build docs",
    "docs:dev": "vitepress dev docs",
    "server": "node server/index.js",
    "dev": "concurrently \"npm run server\" \"npm run docs:dev\"",
    "start": "node server/index.js"
  }
}
```

## 🐳 Alternativa: Deploy com Docker

Se preferir usar Docker no Easypanel:

### Dockerfile

Crie um `Dockerfile` na raiz:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run docs:build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server ./server
COPY --from=builder /app/docs/.vitepress/dist ./docs/.vitepress/dist
COPY --from=builder /app/docs/public ./docs/public
RUN mkdir -p /app/docs/public/uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
```

### No Easypanel

1. Escolha **"Docker"** como tipo de app
2. Easypanel usará o Dockerfile automaticamente
3. Configure as mesmas variáveis de ambiente

## 🔐 Configuração de Segurança

### 1. CORS em Produção

Atualize `server/index.js` para usar o domínio correto:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://seu-dominio.com',
  credentials: true
}));
```

Adicione variável de ambiente:
```
FRONTEND_URL=https://seu-dominio.com
```

### 2. Cookie Seguro

Em produção, os cookies devem ser secure:

```javascript
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

## 📊 Monitoramento

### Logs

No Easypanel:
1. Vá para **"Logs"**
2. Veja logs em tempo real
3. Filtre por erro/warning

### Métricas

Monitore:
- ✅ CPU usage
- ✅ Memory usage
- ✅ Disk usage
- ✅ Network traffic

## 🔄 Atualizações

### Deploy Automático

Configure webhook para deploy automático:

1. Easypanel → **"Settings"** → **"Webhooks"**
2. Copie a URL do webhook
3. No GitHub: **Settings** → **Webhooks** → **Add webhook**
4. Cole a URL e salve

Agora cada push na branch principal fará deploy automático!

### Deploy Manual

No Easypanel:
1. Vá para **"Deployments"**
2. Clique em **"Deploy"**
3. Aguarde o build completar

## 🗄️ Backup

### Backup Automático

Configure backup dos volumes:

1. Easypanel → **"Backups"**
2. Configure frequência (diário recomendado)
3. Escolha retenção (7-30 dias)

### Backup Manual

```bash
# Backup de uploads
easypanel backup create --volume uploads

# Backup de database
easypanel backup create --volume database
```

## 🚨 Troubleshooting

### App não inicia

**Verifique:**
- ✅ Variáveis de ambiente configuradas
- ✅ Port 3000 exposto
- ✅ Build command correto
- ✅ Start command correto

**Logs:**
```bash
# Ver logs do app
easypanel logs --tail 100
```

### Erro de permissão em uploads

**Solução:**
```bash
# Dar permissão de escrita
chmod -R 755 /app/docs/public/uploads
```

### Database não persiste

**Verifique:**
- ✅ Volume montado em `/app/server/database/data`
- ✅ Caminho correto no código

## 📱 Acesso Inicial

Após deploy:

1. Acesse: `https://seu-dominio.com`
2. Login padrão:
   - **Username:** `admin`
   - **Password:** `admin123`
3. **⚠️ IMPORTANTE:** Mude a senha imediatamente!

## 🎯 Checklist Final

Antes de colocar em produção:

- [ ] JWT_SECRET forte configurado
- [ ] Senha do admin alterada
- [ ] Volumes persistentes configurados
- [ ] SSL/HTTPS ativo
- [ ] CORS configurado para domínio correto
- [ ] Backup automático ativo
- [ ] Logs sendo monitorados
- [ ] Domínio personalizado configurado

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Easypanel
2. Consulte a documentação do Easypanel
3. Verifique as issues do projeto

## 🎉 Pronto!

Sua wiki está no ar! Acesse e comece a criar conteúdo.

**URLs importantes:**
- Wiki: `https://seu-dominio.com`
- Admin: `https://seu-dominio.com/admin`
- API: `https://seu-dominio.com/api`

---

**Desenvolvido com ❤️ usando VitePress + Express + SQLite**
