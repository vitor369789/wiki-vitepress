#!/bin/sh

# Script para inicializar volume com arquivos do build

echo "🔍 Verificando se o volume precisa ser inicializado..."

# Se o volume está vazio ou não tem o build
if [ ! -d "/app/docs/.vitepress/dist" ] || [ -z "$(ls -A /app/docs/.vitepress/dist 2>/dev/null)" ]; then
  echo "📦 Volume vazio detectado! Inicializando..."
  
  # Se existe um backup dos arquivos originais
  if [ -d "/app/docs-backup" ]; then
    echo "📋 Copiando arquivos do backup para o volume..."
    cp -r /app/docs-backup/* /app/docs/
    echo "✅ Volume inicializado com sucesso!"
  else
    echo "⚠️ Backup não encontrado. O volume será populado no próximo build."
  fi
else
  echo "✅ Volume já inicializado!"
fi

echo "🚀 Iniciando servidor..."
exec node server/index.js
