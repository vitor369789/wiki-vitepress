<template>
  <div class="config-editor">
    <h2>⚙️ Editor de Configuração</h2>
    <p class="subtitle">Edite a navegação e configurações do site</p>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando configuração...</p>
    </div>

    <div v-else class="editor-container">
      <div class="toolbar">
        <button @click="saveConfig" :disabled="saving" class="btn-primary">
          {{ saving ? '💾 Salvando...' : '💾 Salvar Configuração' }}
        </button>
        <button @click="loadConfig" class="btn-secondary">
          🔄 Recarregar
        </button>
      </div>

      <div class="editor-wrapper">
        <textarea
          v-model="configContent"
          class="code-editor"
          spellcheck="false"
          placeholder="Carregando configuração..."
        ></textarea>
      </div>

      <div class="info-box">
        <h3>💡 Dicas</h3>
        <ul>
          <li><strong>nav:</strong> Menu superior do site</li>
          <li><strong>sidebar:</strong> Menu lateral (árvore de navegação)</li>
          <li>Após salvar, clique em <strong>🔨 Rebuild Site</strong> para aplicar</li>
          <li>Tenha cuidado com a sintaxe TypeScript!</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchApi } from '../utils/api.js';

const loading = ref(true);
const saving = ref(false);
const configContent = ref('');

async function loadConfig() {
  loading.value = true;
  
  try {
    const response = await fetchApi('/api/config');
    
    if (response.ok) {
      const data = await response.json();
      configContent.value = data.content;
    } else {
      alert('Erro ao carregar configuração');
    }
  } catch (error) {
    console.error('Erro ao carregar config:', error);
    alert('Erro ao carregar configuração');
  } finally {
    loading.value = false;
  }
}

async function saveConfig() {
  if (!configContent.value.trim()) {
    alert('Configuração não pode estar vazia!');
    return;
  }

  saving.value = true;

  try {
    const response = await fetchApi('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: configContent.value
      })
    });

    if (response.ok) {
      alert('✅ Configuração salva!\n\nClique em "🔨 Rebuild Site" no painel admin para aplicar as mudanças.');
    } else {
      const data = await response.json();
      alert('Erro: ' + (data.error || 'Erro ao salvar'));
    }
  } catch (error) {
    console.error('Erro ao salvar config:', error);
    alert('Erro ao salvar configuração');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.config-editor {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.subtitle {
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}

.editor-wrapper {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.code-editor {
  width: 100%;
  min-height: 600px;
  padding: 1.5rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: none;
  resize: vertical;
  tab-size: 2;
}

.code-editor:focus {
  outline: 2px solid var(--vp-c-brand);
  outline-offset: -2px;
}

.info-box {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-brand);
  border-radius: 8px;
}

.info-box h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.info-box ul {
  margin: 0;
  padding-left: 1.5rem;
}

.info-box li {
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
}
</style>
