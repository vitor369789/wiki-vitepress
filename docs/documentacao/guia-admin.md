# 📚 Guia do Administrador

Bem-vindo ao guia completo para administradores da iCore Wiki!

## 🚀 Acesso ao Painel Admin

1. Acesse: `https://seu-dominio.com/admin`
2. Faça login com suas credenciais de administrador
3. Você verá 5 abas principais:
   - 👥 **Usuários** - Gerenciar usuários do sistema
   - 🔐 **Permissões** - Controlar acesso às páginas
   - 📝 **Páginas** - Criar e editar páginas markdown
   - 📁 **Arquivos** - Upload de imagens e documentos
   - ⚙️ **Configuração** - Editar navegação e configurações

---

## 📝 Como Criar e Editar Páginas

### Passo 1: Acessar o Editor de Páginas

1. Vá em `/admin`
2. Clique na aba **📝 Páginas**
3. Você verá a lista de todas as páginas existentes

### Passo 2: Criar uma Nova Página

1. Clique no botão **➕ Nova Página**
2. Digite o caminho da página (ex: `mixtel/troubleshooting/fiberhome.md`)
3. Escreva o conteúdo em Markdown
4. Clique em **💾 Salvar**

### Passo 3: Editar uma Página Existente

1. Clique na página que deseja editar na lista
2. Edite o conteúdo no editor
3. Use a visualização ao lado para ver o resultado
4. Clique em **💾 Salvar**

### Passo 4: Aplicar as Mudanças

1. Após salvar, clique no botão **🔨 Rebuild Site** (no topo do painel)
2. Aguarde 30-60 segundos
3. Recarregue a página com **Ctrl+Shift+R**
4. Suas mudanças estarão visíveis! ✅

---

## 📖 Guia de Markdown

Markdown é uma linguagem simples para formatar texto. Aqui estão os principais recursos:

### Títulos

```markdown
# Título Nível 1
## Título Nível 2
### Título Nível 3
#### Título Nível 4
```

**Resultado:**
# Título Nível 1
## Título Nível 2
### Título Nível 3

---

### Texto

```markdown
Texto normal

**Texto em negrito**

*Texto em itálico*

***Texto em negrito e itálico***

~~Texto riscado~~
```

**Resultado:**

Texto normal

**Texto em negrito**

*Texto em itálico*

***Texto em negrito e itálico***

~~Texto riscado~~

---

### Listas

**Lista não ordenada:**
```markdown
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3
```

**Resultado:**
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

**Lista ordenada:**
```markdown
1. Primeiro passo
2. Segundo passo
3. Terceiro passo
```

**Resultado:**
1. Primeiro passo
2. Segundo passo
3. Terceiro passo

---

### Links

```markdown
[Texto do link](https://exemplo.com)

[Link para outra página](/documentacao/primeiros-passos)
```

**Resultado:**

[Texto do link](https://exemplo.com)

[Link para outra página](/documentacao/primeiros-passos)

---

### Imagens

```markdown
![Texto alternativo](/caminho/para/imagem.png)

![Logo](https://exemplo.com/logo.png)
```

**Dica:** Use a aba **📁 Arquivos** para fazer upload de imagens!

---

### Código

**Código inline:**
```markdown
Use o comando `npm install` para instalar.
```

**Resultado:** Use o comando `npm install` para instalar.

**Bloco de código:**
````markdown
```javascript
function hello() {
  console.log('Hello World!');
}
```
````

**Resultado:**
```javascript
function hello() {
  console.log('Hello World!');
}
```

**Linguagens suportadas:** `javascript`, `python`, `bash`, `json`, `html`, `css`, `sql`, etc.

---

### Tabelas

```markdown
| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dado 1   | Dado 2   | Dado 3   |
| Dado 4   | Dado 5   | Dado 6   |
```

**Resultado:**

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dado 1   | Dado 2   | Dado 3   |
| Dado 4   | Dado 5   | Dado 6   |

---

### Citações

```markdown
> Esta é uma citação.
> Pode ter várias linhas.
>
> — Autor
```

**Resultado:**
> Esta é uma citação.
> Pode ter várias linhas.
>
> — Autor

---

### Linha Horizontal

```markdown
---
```

**Resultado:**

---

### Alertas (VitePress)

```markdown
::: tip DICA
Isto é uma dica útil!
:::

::: warning ATENÇÃO
Isto é um aviso importante!
:::

::: danger PERIGO
Isto é um alerta de perigo!
:::

::: info INFORMAÇÃO
Isto é uma informação adicional.
:::
```

**Resultado:**

::: tip DICA
Isto é uma dica útil!
:::

::: warning ATENÇÃO
Isto é um aviso importante!
:::

::: danger PERIGO
Isto é um alerta de perigo!
:::

---

## 🎨 Exemplo Completo de Página

```markdown
# Troubleshooting - ONU não aparece para autorizar

## 📋 Descrição do Problema

Cliente relata que a ONU não está aparecendo na OLT para autorização.

## 🔍 Diagnóstico

### Passo 1: Verificar Conexão Física

1. Verificar se o cabo de fibra está conectado
2. Verificar se a ONU está ligada (LED Power aceso)
3. Verificar se o LED PON está piscando

::: warning ATENÇÃO
Se o LED PON não estiver piscando, pode indicar problema na fibra ou na porta PON.
:::

### Passo 2: Verificar na OLT

Acesse a OLT e execute o comando:

```bash
show gpon onu uncfg
```

**Resultado esperado:**
```
OnuIndex  Sn                   State
gpon-onu_1/1/1:1  FHTT12345678     unknown
```

## ✅ Solução

### Opção 1: Autorizar pela Serial

```bash
interface gpon-onu_1/1/1:1
  name "CLIENTE-FULANO"
  sn-bind enable sn
  tcont 1 name "INTERNET" profile PERFIL-100M
  gemport 1 name "INTERNET" tcont 1
  exit
```

### Opção 2: Autorizar pela MAC

Se a ONU não aparecer pela serial, tente pela MAC:

```bash
show mac gpon onu 1/1/1
```

## 📊 Tabela de LEDs

| LED | Estado | Significado |
|-----|--------|-------------|
| Power | Aceso | ONU ligada |
| PON | Piscando | Sincronizando |
| PON | Aceso | Conectado |
| LAN | Aceso | Dispositivo conectado |

## 🔗 Links Relacionados

- [Manual da ONU](/equipamentos/onus/fiberhome)
- [Comandos OLT](/comandos/olt-fiberhome)
- [Troubleshooting Geral](/troubleshooting/)

---

**Última atualização:** 08/04/2026
```

---

## 📁 Como Fazer Upload de Imagens

1. Vá na aba **📁 Arquivos**
2. Clique em **📤 Upload**
3. Selecione a imagem
4. Copie o caminho da imagem
5. Use no markdown: `![Descrição](/uploads/imagem.png)`

---

## ⚙️ Como Editar a Navegação

1. Vá na aba **⚙️ Configuração**
2. Edite o arquivo `config.mts`
3. Modifique as seções `nav` (menu superior) e `sidebar` (menu lateral)
4. Salve e faça **Rebuild**

**Exemplo de sidebar:**

```typescript
sidebar: {
  '/mixtel/': [
    {
      text: 'Troubleshooting',
      items: [
        { text: 'Fiberhome', link: '/mixtel/troubleshooting/fiberhome/' },
        { text: 'Huawei', link: '/mixtel/troubleshooting/huawei/' }
      ]
    }
  ]
}
```

---

## 🎯 Dicas e Boas Práticas

### Organização de Arquivos

```
docs/
├── mixtel/
│   ├── troubleshooting/
│   │   ├── fiberhome/
│   │   │   ├── index.md
│   │   │   ├── onu-nao-aparece.md
│   │   │   └── perda-sinal.md
│   │   └── huawei/
│   │       └── index.md
│   └── equipamentos/
│       ├── onus.md
│       └── olts.md
└── documentacao/
    └── guia-admin.md
```

### Nomenclatura de Arquivos

- ✅ Use nomes descritivos: `onu-nao-aparece.md`
- ✅ Use letras minúsculas
- ✅ Use hífens ao invés de espaços
- ❌ Evite caracteres especiais: `não`, `ção`, etc.

### Estrutura de Páginas

1. **Título principal** (H1) - Apenas um por página
2. **Descrição** - Breve resumo do conteúdo
3. **Seções** (H2, H3) - Organize o conteúdo
4. **Exemplos práticos** - Use blocos de código
5. **Links relacionados** - Ajude na navegação

---

## 🆘 Problemas Comuns

### Mudanças não aparecem

**Solução:**
1. Certifique-se de ter clicado em **💾 Salvar**
2. Clique em **🔨 Rebuild Site**
3. Aguarde 30-60 segundos
4. Recarregue com **Ctrl+Shift+R** (força reload sem cache)

### Imagem não aparece

**Solução:**
1. Verifique se fez upload na aba **📁 Arquivos**
2. Use o caminho correto: `/uploads/nome-da-imagem.png`
3. Certifique-se de que a imagem tem extensão válida (`.png`, `.jpg`, `.gif`)

### Erro ao salvar

**Solução:**
1. Verifique sua conexão com a internet
2. Faça login novamente
3. Tente salvar novamente

---

## 📞 Suporte

Se precisar de ajuda:

1. Consulte a [FAQ](/faq)
2. Veja a [Documentação Completa](/documentacao/)
3. Entre em contato com o suporte técnico

---

**Última atualização:** Abril 2026
