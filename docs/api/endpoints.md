# Endpoints

Referência completa de todos os endpoints da API.

## 📋 Registros

### Listar Registros

```http
GET /registros
```

**Parâmetros de Query**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | integer | Número da página (padrão: 1) |
| `limit` | integer | Itens por página (padrão: 20, máx: 100) |
| `status` | string | Filtrar por status |
| `sort` | string | Campo para ordenação |
| `order` | string | `asc` ou `desc` |

**Exemplo**:

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://api.seu-sistema.com.br/v1/registros?page=1&limit=20&status=ativo"
```

**Resposta** (200 OK):

```json
{
  "data": [
    {
      "id": "123",
      "titulo": "Exemplo",
      "descricao": "Descrição do registro",
      "status": "ativo",
      "created_at": "2025-04-08T10:00:00Z",
      "updated_at": "2025-04-08T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Obter Registro

```http
GET /registros/:id
```

**Exemplo**:

```bash
curl -H "Authorization: Bearer TOKEN" \
  https://api.seu-sistema.com.br/v1/registros/123
```

**Resposta** (200 OK):

```json
{
  "id": "123",
  "titulo": "Exemplo",
  "descricao": "Descrição completa",
  "status": "ativo",
  "tags": ["importante", "urgente"],
  "metadata": {
    "autor": "user@exemplo.com",
    "departamento": "TI"
  },
  "created_at": "2025-04-08T10:00:00Z",
  "updated_at": "2025-04-08T10:00:00Z"
}
```

### Criar Registro

```http
POST /registros
```

**Body**:

```json
{
  "titulo": "Novo Registro",
  "descricao": "Descrição do novo registro",
  "status": "ativo",
  "tags": ["tag1", "tag2"]
}
```

**Exemplo**:

```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Novo Registro","status":"ativo"}' \
  https://api.seu-sistema.com.br/v1/registros
```

**Resposta** (201 Created):

```json
{
  "id": "124",
  "titulo": "Novo Registro",
  "descricao": "Descrição do novo registro",
  "status": "ativo",
  "created_at": "2025-04-08T11:00:00Z"
}
```

### Atualizar Registro

```http
PUT /registros/:id
PATCH /registros/:id
```

**Body**:

```json
{
  "titulo": "Título Atualizado",
  "status": "concluido"
}
```

**Resposta** (200 OK):

```json
{
  "id": "123",
  "titulo": "Título Atualizado",
  "status": "concluido",
  "updated_at": "2025-04-08T12:00:00Z"
}
```

### Deletar Registro

```http
DELETE /registros/:id
```

**Resposta** (204 No Content)

## 👥 Usuários

### Listar Usuários

```http
GET /usuarios
```

**Resposta** (200 OK):

```json
{
  "data": [
    {
      "id": "user-123",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "role": "admin",
      "ativo": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Obter Usuário Atual

```http
GET /usuarios/me
```

**Resposta** (200 OK):

```json
{
  "id": "user-123",
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "role": "admin",
  "preferencias": {
    "idioma": "pt-BR",
    "tema": "escuro"
  }
}
```

### Criar Usuário

```http
POST /usuarios
```

**Body**:

```json
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "role": "usuario",
  "senha": "senha_segura_123"
}
```

**Resposta** (201 Created)

### Atualizar Usuário

```http
PUT /usuarios/:id
```

### Deletar Usuário

```http
DELETE /usuarios/:id
```

## 📊 Relatórios

### Gerar Relatório

```http
POST /relatorios
```

**Body**:

```json
{
  "tipo": "resumo_mensal",
  "periodo": {
    "inicio": "2025-04-01",
    "fim": "2025-04-30"
  },
  "formato": "pdf",
  "filtros": {
    "status": "concluido",
    "departamento": "vendas"
  }
}
```

**Resposta** (202 Accepted):

```json
{
  "id": "report-456",
  "status": "processando",
  "url": null,
  "created_at": "2025-04-08T13:00:00Z"
}
```

### Obter Status do Relatório

```http
GET /relatorios/:id
```

**Resposta** (200 OK):

```json
{
  "id": "report-456",
  "status": "concluido",
  "url": "https://cdn.seu-sistema.com/relatorios/report-456.pdf",
  "expires_at": "2025-04-15T13:00:00Z"
}
```

## 🔔 Webhooks

### Listar Webhooks

```http
GET /webhooks
```

**Resposta** (200 OK):

```json
{
  "data": [
    {
      "id": "webhook-789",
      "url": "https://seu-site.com/webhook",
      "eventos": ["registro.criado", "registro.atualizado"],
      "ativo": true,
      "created_at": "2025-04-01T00:00:00Z"
    }
  ]
}
```

### Criar Webhook

```http
POST /webhooks
```

**Body**:

```json
{
  "url": "https://seu-site.com/webhook",
  "eventos": ["registro.criado", "registro.atualizado"],
  "secret": "seu_secret_opcional"
}
```

**Resposta** (201 Created):

```json
{
  "id": "webhook-789",
  "url": "https://seu-site.com/webhook",
  "eventos": ["registro.criado"],
  "secret": "whsec_...",
  "ativo": true
}
```

### Testar Webhook

```http
POST /webhooks/:id/test
```

**Resposta** (200 OK):

```json
{
  "success": true,
  "status_code": 200,
  "response_time": 145
}
```

### Deletar Webhook

```http
DELETE /webhooks/:id
```

## 📁 Upload de Arquivos

### Upload

```http
POST /arquivos
Content-Type: multipart/form-data
```

**Exemplo**:

```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@documento.pdf" \
  -F "tipo=documento" \
  https://api.seu-sistema.com.br/v1/arquivos
```

**Resposta** (201 Created):

```json
{
  "id": "file-999",
  "nome": "documento.pdf",
  "tamanho": 1024000,
  "tipo": "application/pdf",
  "url": "https://cdn.seu-sistema.com/files/file-999.pdf",
  "created_at": "2025-04-08T14:00:00Z"
}
```

### Download

```http
GET /arquivos/:id/download
```

## 🔍 Busca

### Busca Global

```http
GET /busca?q=termo
```

**Parâmetros**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Termo de busca (obrigatório) |
| `tipo` | string | Tipo de recurso |
| `limit` | integer | Limite de resultados |

**Resposta** (200 OK):

```json
{
  "resultados": [
    {
      "tipo": "registro",
      "id": "123",
      "titulo": "Resultado encontrado",
      "relevancia": 0.95
    }
  ],
  "total": 1
}
```

## 📈 Estatísticas

### Dashboard

```http
GET /estatisticas/dashboard
```

**Resposta** (200 OK):

```json
{
  "total_registros": 1000,
  "registros_ativos": 750,
  "registros_mes": 50,
  "usuarios_ativos": 25,
  "graficos": {
    "registros_por_mes": [
      {"mes": "2025-01", "total": 100},
      {"mes": "2025-02", "total": 120}
    ]
  }
}
```

## 🔄 Batch Operations

### Operações em Lote

```http
POST /batch
```

**Body**:

```json
{
  "operacoes": [
    {
      "metodo": "POST",
      "endpoint": "/registros",
      "body": {"titulo": "Registro 1"}
    },
    {
      "metodo": "PUT",
      "endpoint": "/registros/123",
      "body": {"status": "concluido"}
    }
  ]
}
```

**Resposta** (200 OK):

```json
{
  "resultados": [
    {"status": 201, "body": {"id": "125"}},
    {"status": 200, "body": {"id": "123"}}
  ]
}
```

## ⚠️ Códigos de Erro

### Formato de Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "campo": "email",
        "mensagem": "Email inválido"
      }
    ]
  }
}
```

### Códigos Comuns

| Código | HTTP | Descrição |
|--------|------|-----------|
| `VALIDATION_ERROR` | 400 | Dados inválidos |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `RATE_LIMIT` | 429 | Limite excedido |
| `INTERNAL_ERROR` | 500 | Erro interno |

## 💡 Exemplos Completos

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.seu-sistema.com.br/v1',
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`
  }
});

// Criar registro
async function criarRegistro() {
  try {
    const response = await api.post('/registros', {
      titulo: 'Novo Registro',
      status: 'ativo'
    });
    console.log('Criado:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}

// Listar com paginação
async function listarRegistros(page = 1) {
  const response = await api.get('/registros', {
    params: { page, limit: 20 }
  });
  return response.data;
}
```

### Python

```python
import requests
import os

class API:
    def __init__(self):
        self.base_url = 'https://api.seu-sistema.com.br/v1'
        self.headers = {
            'Authorization': f'Bearer {os.getenv("API_KEY")}',
            'Content-Type': 'application/json'
        }
    
    def criar_registro(self, dados):
        response = requests.post(
            f'{self.base_url}/registros',
            json=dados,
            headers=self.headers
        )
        return response.json()
    
    def listar_registros(self, page=1, limit=20):
        response = requests.get(
            f'{self.base_url}/registros',
            params={'page': page, 'limit': limit},
            headers=self.headers
        )
        return response.json()
```

---

<div style="text-align: center; margin-top: 2rem;">
  <p>Explore mais na <a href="./">documentação da API</a>!</p>
</div>
