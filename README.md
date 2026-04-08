# 📚 Wiki - Documentação com VitePress

Wiki moderna e profissional construída com VitePress, similar à documentação da IXC Soft.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run docs:dev

# Build para produção
npm run docs:build

# Preview do build
npm run docs:preview
```

## 📁 Estrutura do Projeto

```
wiki/
├── docs/                      # Conteúdo da documentação
│   ├── .vitepress/           # Configurações do VitePress
│   │   ├── config.mts        # Configuração principal
│   │   └── theme/            # Customização do tema
│   │       ├── index.ts      # Tema customizado
│   │       └── custom.css    # Estilos personalizados
│   ├── public/               # Arquivos estáticos
│   │   └── logo.svg          # Logo do site
│   ├── index.md              # Página inicial
│   ├── documentacao/         # Seção de documentação
│   │   ├── index.md
│   │   ├── primeiros-passos.md
│   │   ├── guias/
│   │   └── recursos/
│   ├── api/                  # Documentação da API
│   │   ├── index.md
│   │   ├── autenticacao.md
│   │   └── endpoints.md
│   └── faq.md                # Perguntas frequentes
├── package.json              # Dependências do projeto
└── README.md                 # Este arquivo
```

## 🎨 Personalização

### Alterar Cores

Edite `docs/.vitepress/theme/custom.css`:

```css
:root {
  --vp-c-brand-1: #3b82f6;  /* Cor primária */
  --vp-c-brand-2: #2563eb;  /* Cor secundária */
  --vp-c-brand-3: #1d4ed8;  /* Cor terciária */
}
```

### Configurar Navegação

Edite `docs/.vitepress/config.mts`:

```typescript
nav: [
  { text: 'Início', link: '/' },
  { text: 'Docs', link: '/documentacao/' }
]
```

### Adicionar Logo

Substitua `docs/public/logo.svg` pelo seu logo.

## 📝 Criando Conteúdo

### Nova Página

1. Crie um arquivo `.md` em `docs/`
2. Adicione frontmatter (opcional):

```markdown
---
title: Título da Página
description: Descrição da página
---

# Conteúdo aqui
```

### Componentes do VitePress

```markdown
::: tip Dica
Conteúdo da dica
:::

::: warning Atenção
Conteúdo do aviso
:::

::: danger Perigo
Conteúdo de perigo
:::

::: info Informação
Conteúdo informativo
:::
```

## 🚀 Deploy

### Netlify

1. Conecte seu repositório
2. Configure:
   - Build command: `npm run docs:build`
   - Publish directory: `docs/.vitepress/dist`

### Vercel

1. Importe o projeto
2. Configure:
   - Framework Preset: VitePress
   - Build Command: `npm run docs:build`
   - Output Directory: `docs/.vitepress/dist`

### GitHub Pages

```bash
# Build
npm run docs:build

# Deploy (configure no package.json)
npm run docs:deploy
```

## 🔧 Configurações Avançadas

### Busca Local

Já configurada! Use `Ctrl+K` ou `Cmd+K` para buscar.

### Modo Escuro

Automático! Alterna entre claro/escuro.

### Internacionalização

Edite `config.mts` para adicionar múltiplos idiomas:

```typescript
locales: {
  root: {
    label: 'Português',
    lang: 'pt-BR'
  },
  en: {
    label: 'English',
    lang: 'en-US',
    link: '/en/'
  }
}
```

## 📚 Recursos

- [Documentação VitePress](https://vitepress.dev)
- [Guia Markdown](https://vitepress.dev/guide/markdown)
- [Configuração do Tema](https://vitepress.dev/reference/default-theme-config)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 💬 Suporte

- Email: vitor.rodrigues@vmcore.com.br
- Issues: [GitHub Issues](https://github.com/vitor369789/wiki-vitepress/issues)

---

Desenvolvido com ❤️ usando [VitePress](https://vitepress.dev)
