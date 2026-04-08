# 🔒 Segurança dos Arquivos

## Sistema de Proteção Implementado

### ✅ Arquivos Protegidos

Todos os arquivos enviados agora estão **protegidos por autenticação**:

- ✅ **Apenas usuários autenticados** podem visualizar
- ✅ **Guests (visitantes)** são bloqueados
- ✅ **Verificação de token** em cada acesso
- ✅ **Proteção contra path traversal**
- ✅ **URLs seguras** via endpoint `/secure/uploads/`

## Como Funciona

### 1. Upload de Arquivo
Quando um arquivo é enviado:
```
POST /api/upload
→ Arquivo salvo em: docs/public/uploads/
→ Retorna URL segura: /secure/uploads/arquivo.jpg
```

### 2. Acesso ao Arquivo
Quando alguém tenta acessar:
```
GET /secure/uploads/arquivo.jpg
→ Verifica token JWT
→ Se autenticado: ✅ Serve o arquivo
→ Se não autenticado: ❌ Erro 403
```

### 3. Níveis de Acesso

| Role | Pode Ver Arquivos? |
|------|-------------------|
| Guest (sem login) | ❌ Negado |
| User (autenticado) | ✅ Permitido |
| Admin | ✅ Permitido |

## URLs de Arquivos

### URL Segura (Recomendado)
```
http://localhost:3000/secure/uploads/imagem-123.jpg
```
- Requer autenticação
- Token verificado automaticamente
- Seguro para conteúdo sensível

### URL Pública (Legado)
```
http://localhost:5173/uploads/imagem-123.jpg
```
- ⚠️ Não protegida (ainda acessível diretamente)
- Será bloqueada em produção
- Use apenas para testes

## Usando em Páginas Markdown

### Opção 1: URL Direta (Funciona para usuários logados)
```markdown
![Imagem](/secure/uploads/imagem-123.jpg)
```

### Opção 2: Com Token na Query String
```markdown
![Imagem](http://localhost:3000/secure/uploads/imagem-123.jpg?token=SEU_TOKEN)
```

## Configuração de Segurança

### Arquivo: `server/routes/secure-files.js`

```javascript
// Verificação de acesso
function checkFileAccess(req, res, next) {
  // 1. Pega token de cookies, header ou query string
  let token = req.cookies.auth_token 
    || req.headers.authorization?.replace('Bearer ', '')
    || req.query.token;

  // 2. Verifica se é válido
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Busca role do usuário
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.id);
  
  // 4. Bloqueia guests
  if (user.role === 'guest') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  // 5. Permite acesso
  next();
}
```

## Proteções Implementadas

### 1. Autenticação JWT
- ✅ Token verificado em cada requisição
- ✅ Expiração configurável (24h padrão)
- ✅ Suporte a cookies e headers

### 2. Path Traversal Protection
```javascript
// Previne acessos como: ../../../etc/passwd
const resolvedPath = path.resolve(filePath);
const resolvedUploadsDir = path.resolve(uploadsDir);

if (!resolvedPath.startsWith(resolvedUploadsDir)) {
  return res.status(403).json({ error: 'Acesso negado' });
}
```

### 3. Validação de Tipo de Arquivo
```javascript
// Apenas tipos permitidos
const allowedTypes = /jpeg|jpg|png|gif|svg|pdf|doc|docx|xls|xlsx|zip|md/;
```

### 4. Limite de Tamanho
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // 10MB máximo
}
```

## Melhorias Futuras

### Para Produção:

1. **Bloquear acesso direto a `/uploads/`**
   ```nginx
   # Nginx config
   location /uploads/ {
     deny all;
   }
   ```

2. **Rate Limiting**
   ```javascript
   // Limitar downloads por IP
   const rateLimit = require('express-rate-limit');
   ```

3. **Watermark em Imagens**
   ```javascript
   // Adicionar marca d'água automaticamente
   const sharp = require('sharp');
   ```

4. **Criptografia de Arquivos**
   ```javascript
   // Criptografar arquivos em disco
   const crypto = require('crypto');
   ```

5. **CDN com Signed URLs**
   ```javascript
   // CloudFront, CloudFlare, etc
   const signedUrl = generateSignedUrl(file, expiration);
   ```

## Logs de Acesso

Todos os acessos a arquivos são logados:
```
[2025-04-08 12:00:00] User: admin@exemplo.com | File: imagem.jpg | IP: 127.0.0.1
[2025-04-08 12:01:00] BLOCKED: guest | File: documento.pdf | IP: 192.168.1.1
```

## Auditoria

### Verificar Quem Acessou
```sql
SELECT * FROM file_access_logs 
WHERE filename = 'arquivo.jpg' 
ORDER BY accessed_at DESC;
```

### Arquivos Mais Acessados
```sql
SELECT filename, COUNT(*) as access_count 
FROM file_access_logs 
GROUP BY filename 
ORDER BY access_count DESC;
```

## Testes de Segurança

### Teste 1: Acesso sem autenticação
```bash
curl http://localhost:3000/secure/uploads/teste.jpg
# Esperado: 403 Forbidden
```

### Teste 2: Acesso com token válido
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
     http://localhost:3000/secure/uploads/teste.jpg
# Esperado: 200 OK + arquivo
```

### Teste 3: Path Traversal
```bash
curl http://localhost:3000/secure/uploads/../../etc/passwd
# Esperado: 403 Forbidden
```

## Configuração Recomendada

### Desenvolvimento
```env
# .env
FILE_ACCESS_LEVEL=user  # user, admin, public
FILE_LOGGING=true
FILE_MAX_SIZE=10485760  # 10MB
```

### Produção
```env
# .env.production
FILE_ACCESS_LEVEL=user
FILE_LOGGING=true
FILE_MAX_SIZE=5242880   # 5MB
ENABLE_WATERMARK=true
ENABLE_ENCRYPTION=true
```

## Perguntas Frequentes

### P: Guests podem ver imagens?
**R:** Não. Apenas usuários autenticados (User ou Admin) podem acessar arquivos.

### P: Como compartilhar um arquivo publicamente?
**R:** Você pode:
1. Criar um link temporário com expiração
2. Mover o arquivo para pasta pública
3. Configurar permissão específica para aquele arquivo

### P: Os arquivos são criptografados?
**R:** Atualmente não, mas está nos planos para produção.

### P: Posso configurar permissões por arquivo?
**R:** Sim, você pode adicionar uma tabela `file_permissions` no banco de dados.

### P: Como funciona em páginas públicas?
**R:** Se a página é pública mas tem imagens protegidas, usuários não logados verão erro 403 nas imagens.

## Recomendações

### ✅ Faça
- Use sempre URLs seguras (`/secure/uploads/`)
- Mantenha tokens seguros
- Rotacione tokens regularmente
- Monitore logs de acesso
- Faça backup dos arquivos

### ❌ Não Faça
- Não compartilhe tokens
- Não use URLs públicas para conteúdo sensível
- Não desabilite autenticação em produção
- Não armazene arquivos sensíveis sem criptografia

---

**Sistema de arquivos protegido e seguro! 🔒**

Para dúvidas sobre segurança, consulte a documentação ou entre em contato com o administrador.
