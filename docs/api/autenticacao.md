# Autenticação

Guia completo de autenticação na API.

## 🔐 Métodos de Autenticação

### API Key (Recomendado)

A forma mais simples de autenticar:

```bash
curl -H "Authorization: Bearer SEU_API_KEY" \
     https://api.seu-sistema.com.br/v1/registros
```

#### Obter API Key

1. Acesse **Configurações** > **API**
2. Clique em "Gerar Nova Chave"
3. Copie e armazene com segurança
4. Nunca compartilhe sua chave

### OAuth 2.0

Para aplicações que acessam dados de usuários:

#### 1. Registrar Aplicação

```json
{
  "nome": "Minha App",
  "redirect_uri": "https://minha-app.com/callback",
  "scopes": ["read", "write"]
}
```

#### 2. Autorização

```
GET https://api.seu-sistema.com.br/oauth/authorize?
    client_id=SEU_CLIENT_ID&
    redirect_uri=https://minha-app.com/callback&
    response_type=code&
    scope=read+write
```

#### 3. Trocar código por token

```bash
curl -X POST https://api.seu-sistema.com.br/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=CODIGO_RECEBIDO" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET" \
  -d "redirect_uri=https://minha-app.com/callback"
```

**Resposta**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200..."
}
```

#### 4. Usar o token

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
     https://api.seu-sistema.com.br/v1/registros
```

### JWT (JSON Web Token)

Para autenticação stateless:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { user_id: '123', email: 'user@exemplo.com' },
  'SEU_SECRET',
  { expiresIn: '1h' }
);
```

## 🔄 Refresh Token

Renove tokens expirados:

```bash
curl -X POST https://api.seu-sistema.com.br/oauth/token \
  -d "grant_type=refresh_token" \
  -d "refresh_token=SEU_REFRESH_TOKEN" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET"
```

## 🎯 Scopes

Controle permissões granulares:

| Scope | Descrição |
|-------|-----------|
| `read` | Leitura de dados |
| `write` | Criação e edição |
| `delete` | Exclusão de dados |
| `admin` | Acesso administrativo |

**Exemplo com múltiplos scopes**:

```
scope=read+write+delete
```

## 🔒 Segurança

### Armazenamento Seguro

::: danger Nunca faça isso
```javascript
// ❌ ERRADO - Nunca hardcode tokens
const API_KEY = 'sk_live_1234567890';
```
:::

::: tip Faça isso
```javascript
// ✅ CORRETO - Use variáveis de ambiente
const API_KEY = process.env.API_KEY;
```
:::

### Rotação de Chaves

Rotacione chaves regularmente:

1. Gere nova chave
2. Atualize aplicações
3. Revogue chave antiga
4. Monitore logs

### HTTPS Obrigatório

::: warning Importante
Todas as requisições devem usar HTTPS. Requisições HTTP serão rejeitadas.
:::

## 🧪 Testando Autenticação

### cURL

```bash
# Teste básico
curl -i -H "Authorization: Bearer SEU_TOKEN" \
     https://api.seu-sistema.com.br/v1/auth/verify
```

### Postman

1. Importe nossa [Collection](https://postman.com/seu-workspace)
2. Configure variável `api_key`
3. Execute request de teste

### JavaScript

```javascript
async function testarAuth() {
  try {
    const response = await fetch(
      'https://api.seu-sistema.com.br/v1/auth/verify',
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      }
    );
    
    if (response.ok) {
      console.log('✅ Autenticação válida');
    } else {
      console.log('❌ Autenticação falhou');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

## 📊 Monitoramento

### Logs de Acesso

Monitore uso da API:

```
Configurações > API > Logs de Acesso
```

**Informações disponíveis**:
- Timestamp
- Endpoint acessado
- IP de origem
- Status da resposta
- Tempo de resposta

### Alertas

Configure alertas para:
- Tentativas de acesso não autorizado
- Uso excessivo de API
- Tokens expirados
- Padrões suspeitos

## 🚨 Erros Comuns

### 401 Unauthorized

**Causa**: Token inválido ou expirado

**Solução**:
```bash
# Verifique se o token está correto
# Gere um novo token se necessário
```

### 403 Forbidden

**Causa**: Sem permissão para o recurso

**Solução**:
- Verifique os scopes do token
- Solicite permissões adicionais

### 429 Too Many Requests

**Causa**: Limite de requisições excedido

**Solução**:
- Implemente retry com backoff
- Aumente seu plano
- Use cache

## 💡 Exemplos Práticos

### Node.js com Axios

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.seu-sistema.com.br/v1',
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Interceptor para refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Renovar token
      const newToken = await refreshToken();
      error.config.headers['Authorization'] = `Bearer ${newToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Python com Requests

```python
import os
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

class APIClient:
    def __init__(self):
        self.base_url = 'https://api.seu-sistema.com.br/v1'
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {os.getenv("API_KEY")}',
            'Content-Type': 'application/json'
        })
        
        # Retry strategy
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount('https://', adapter)
    
    def get(self, endpoint):
        return self.session.get(f'{self.base_url}/{endpoint}')
```

## 📚 Recursos Adicionais

- [Endpoints](./endpoints) - Lista completa de endpoints
- [Rate Limits](/api/#rate-limits) - Limites de requisições
- [SDKs Oficiais](/api/#sdks-oficiais) - Bibliotecas prontas
- [Postman Collection](https://postman.com/seu-workspace)

---

<div style="text-align: center; margin-top: 2rem;">
  <p>Autenticação configurada? Explore os <a href="./endpoints">endpoints disponíveis</a>!</p>
</div>
