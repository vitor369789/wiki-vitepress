# API Documentation

Documentação completa da API REST do sistema.

## 🚀 Visão Geral

Nossa API REST permite integrar o sistema com suas aplicações de forma simples e segura.

### Características

- **RESTful**: Segue os princípios REST
- **JSON**: Formato de dados padrão
- **Autenticação**: OAuth 2.0 e API Keys
- **Versionamento**: Suporte a múltiplas versões
- **Rate Limiting**: Controle de requisições
- **Webhooks**: Notificações em tempo real

### Base URL

```
https://api.seu-sistema.com.br/v1
```

### Ambientes

| Ambiente | URL | Uso |
|----------|-----|-----|
| Produção | `https://api.seu-sistema.com.br/v1` | Aplicações em produção |
| Sandbox | `https://sandbox-api.seu-sistema.com.br/v1` | Testes e desenvolvimento |

## 🔐 Autenticação

Veja o guia completo de [Autenticação](./autenticacao).

### Quick Start

```bash
# Usando API Key
curl -H "Authorization: Bearer SEU_TOKEN" \
     https://api.seu-sistema.com.br/v1/registros
```

## 📚 Recursos

### Principais Endpoints

- [Registros](./endpoints#registros) - CRUD de registros
- [Usuários](./endpoints#usuarios) - Gerenciamento de usuários
- [Relatórios](./endpoints#relatorios) - Geração de relatórios
- [Webhooks](./endpoints#webhooks) - Configuração de webhooks

## 📊 Rate Limits

| Plano | Requisições/hora | Requisições/dia |
|-------|------------------|-----------------|
| Free | 100 | 1,000 |
| Basic | 1,000 | 10,000 |
| Pro | 10,000 | 100,000 |
| Enterprise | Ilimitado | Ilimitado |

## 🔔 Webhooks

Configure webhooks para receber notificações de eventos:

```json
{
  "url": "https://seu-site.com/webhook",
  "eventos": ["registro.criado", "registro.atualizado"],
  "ativo": true
}
```

## 📖 Exemplos

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.seu-sistema.com.br/v1',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN',
    'Content-Type': 'application/json'
  }
});

// Listar registros
const registros = await api.get('/registros');
console.log(registros.data);
```

### Python

```python
import requests

headers = {
    'Authorization': 'Bearer SEU_TOKEN',
    'Content-Type': 'application/json'
}

# Listar registros
response = requests.get(
    'https://api.seu-sistema.com.br/v1/registros',
    headers=headers
)
print(response.json())
```

### PHP

```php
<?php
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.seu-sistema.com.br/v1/registros",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer SEU_TOKEN",
        "Content-Type: application/json"
    ],
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>
```

## 🛠️ SDKs Oficiais

- [JavaScript/TypeScript](https://github.com/seu-usuario/sdk-js)
- [Python](https://github.com/seu-usuario/sdk-python)
- [PHP](https://github.com/seu-usuario/sdk-php)
- [Ruby](https://github.com/seu-usuario/sdk-ruby)

## 📝 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Limite de requisições excedido |
| 500 | Erro interno |

## 🔍 Filtros e Paginação

### Paginação

```bash
GET /registros?page=1&limit=20
```

### Filtros

```bash
GET /registros?status=ativo&data_inicio=2025-01-01
```

### Ordenação

```bash
GET /registros?sort=created_at&order=desc
```

## 💡 Boas Práticas

::: tip Recomendações
- Use HTTPS sempre
- Armazene tokens de forma segura
- Implemente retry logic
- Cache respostas quando possível
- Monitore rate limits
:::

## 🆘 Suporte

- [Status da API](https://status.seu-sistema.com)
- [Changelog](https://changelog.seu-sistema.com)
- [Suporte](mailto:api@seu-sistema.com)
- [Comunidade](https://comunidade.seu-sistema.com)

## 📚 Próximos Passos

- [Autenticação](./autenticacao) - Configure autenticação
- [Endpoints](./endpoints) - Explore todos os endpoints
- [Exemplos](https://github.com/seu-usuario/api-exemplos) - Veja exemplos práticos

---

<div style="text-align: center; margin-top: 2rem;">
  <p>Comece agora com a <a href="./autenticacao">autenticação</a>!</p>
</div>
