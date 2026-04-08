# Build stage para VitePress
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do VitePress
RUN npm run docs:build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev

# Copiar código do servidor
COPY server ./server

# Copiar build do VitePress
COPY --from=builder /app/docs/.vitepress/dist ./docs/.vitepress/dist
COPY --from=builder /app/docs/public ./docs/public

# Criar diretório para uploads
RUN mkdir -p /app/docs/public/uploads

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar
CMD ["node", "server/index.js"]
