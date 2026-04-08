# 📦 Configurar Volume Persistente no Easypanel

## ❌ Problema Atual

Quando você edita arquivos markdown no Editor de Páginas:
- ✅ O arquivo é salvo no container
- ✅ O VitePress rebuilda
- ❌ **Mas ao reiniciar o container, tudo volta ao padrão!**

**Motivo:** Os arquivos estão apenas em memória do container, não persistem.

---

## ✅ Solução: Volume Persistente

### Passo 1: Acessar Configurações

1. Acesse o **Easypanel**
2. Vá no seu serviço **wiki-vitepress**
3. Clique em **Settings** ou **Configurações**

### Passo 2: Configurar Variáveis de Ambiente

**IMPORTANTE:** Antes de adicionar volumes, configure as variáveis de ambiente:

Vá em **Environment** ou **Settings** e adicione:

```env
JWT_SECRET=sua-chave-secreta-super-segura-aqui
NODE_ENV=production
PORT=3000
ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=admin123
```

⚠️ **Troque `JWT_SECRET` por um valor aleatório e seguro!**

### Passo 3: Adicionar Volumes

Procure pela seção **Mounts** ou **Volumes** e adicione **2 volumes**:

**Volume 1 - Documentos:**
```
Container Path: /app/docs
Volume Name: wiki-docs
```

**Volume 2 - Banco de Dados:**
```
Container Path: /app/data
Volume Name: wiki-data
```

### Passo 4: Rebuild

Após adicionar variáveis e volumes, faça **Rebuild** do serviço.

---

## 🎯 O que isso faz?

- ✅ Todos os arquivos em `/app/docs` serão **persistidos**
- ✅ Edições no Editor de Páginas serão **permanentes**
- ✅ Mesmo reiniciando o container, as mudanças **permanecem**
- ✅ Uploads de imagens também serão **persistentes**

---

## 📋 Verificação

Após configurar o volume:

1. Edite uma página no Editor
2. Salve
3. Aguarde 30 segundos (rebuild)
4. Recarregue a página - deve ver as mudanças
5. **Reinicie o container**
6. As mudanças devem **permanecer**!

---

## 🔄 Alternativa: Usar Git

Se não quiser usar volumes, você pode:

1. Configurar Git no Dockerfile
2. Fazer commits automáticos após cada edição
3. Fazer pull ao iniciar o container

Mas isso é mais complexo. **Recomendo usar volumes!**

---

## 📞 Suporte

Se tiver dúvidas sobre como configurar volumes no Easypanel:
- Documentação: https://easypanel.io/docs
- Procure por "Persistent Storage" ou "Volumes"
