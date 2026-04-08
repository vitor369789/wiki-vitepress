# Build stage para VitePress
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build do VitePress
RUN npm run docs:build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (necessário para rebuild do VitePress)
RUN npm install

# Copiar código do servidor
COPY server ./server

# Copiar arquivos markdown originais (necessário para o editor)
COPY docs ./docs

# Copiar build do VitePress (sobrescreve .vitepress/dist)
COPY --from=builder /app/docs/.vitepress/dist ./docs/.vitepress/dist

# Criar backup dos arquivos docs (para inicializar volume)
RUN cp -r /app/docs /app/docs-backup

# Criar diretório para uploads
RUN mkdir -p /app/docs/public/uploads

# Copiar script de inicialização
COPY init-volume.sh /app/init-volume.sh
RUN chmod +x /app/init-volume.sh

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar (com inicialização de volume)
CMD ["/app/init-volume.sh"]
