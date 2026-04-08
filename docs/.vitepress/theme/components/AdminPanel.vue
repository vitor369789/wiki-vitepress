<template>
  <div class="admin-panel">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>

    <div v-else-if="!isAdmin" class="access-denied">
      <h1>🔒 Acesso Negado</h1>
      <p>Apenas administradores podem acessar esta página.</p>
      <button @click="goHome" class="btn-secondary">Voltar para Home</button>
    </div>

    <div v-else class="admin-content">
      <div class="header-section">
        <div>
          <h1>⚙️ Painel Administrativo</h1>
          <p class="subtitle">Gerencie usuários e permissões do sistema</p>
        </div>
        <button @click="triggerRebuild" :disabled="rebuilding" class="btn-rebuild">
          <span v-if="!rebuilding">🔨 Rebuild Site</span>
          <span v-else>⏳ Rebuilding...</span>
        </button>
      </div>

      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          👥 Usuários
        </button>
        <button 
          :class="['tab', { active: activeTab === 'permissions' }]"
          @click="activeTab = 'permissions'"
        >
          🔐 Permissões
        </button>
        <button 
          :class="['tab', { active: activeTab === 'pages' }]"
          @click="activeTab = 'pages'"
        >
          📝 Páginas
        </button>
        <button 
          :class="['tab', { active: activeTab === 'files' }]"
          @click="activeTab = 'files'"
        >
          📁 Arquivos
        </button>
        <button 
          :class="['tab', { active: activeTab === 'config' }]"
          @click="activeTab = 'config'"
        >
          ⚙️ Configuração
        </button>
      </div>

      <div v-if="activeTab === 'users'" class="tab-content">
        <UsersManager />
      </div>

      <div v-if="activeTab === 'permissions'" class="tab-content">
        <PermissionsManager />
      </div>

      <div v-if="activeTab === 'pages'" class="tab-content">
        <PagesEditor />
      </div>

      <div v-if="activeTab === 'files'" class="tab-content">
        <FilesManager />
      </div>

      <div v-if="activeTab === 'config'" class="tab-content">
        <ConfigEditor />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UsersManager from './UsersManager.vue';
import PermissionsManager from './PermissionsManager.vue';
import PagesEditor from './PagesEditor.vue';
import FilesManager from './FilesManager.vue';
import ConfigEditor from './ConfigEditor.vue';
import { fetchApi } from '../utils/api.js';

const loading = ref(true);
const isAdmin = ref(false);
const activeTab = ref('users');
const rebuilding = ref(false);

async function triggerRebuild() {
  if (rebuilding.value) return;
  
  rebuilding.value = true;
  
  try {
    const response = await fetchApi('/api/rebuild', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('🔨 Rebuild iniciado!\n\nAguarde 30-60 segundos e recarregue a página (Ctrl+Shift+R) para ver as mudanças.');
      
      // Verificar status a cada 5 segundos
      const checkStatus = setInterval(async () => {
        const statusResponse = await fetchApi('/api/rebuild-status');
        const status = await statusResponse.json();
        
        if (!status.isRebuilding) {
          clearInterval(checkStatus);
          rebuilding.value = false;
          
          if (status.lastError) {
            alert('❌ Erro no rebuild: ' + status.lastError);
          } else {
            alert('✅ Rebuild concluído!\n\nRecarregue a página (Ctrl+Shift+R) para ver as mudanças.');
          }
        }
      }, 5000);
    } else {
      alert(data.message);
      rebuilding.value = false;
    }
  } catch (error) {
    console.error('Erro ao iniciar rebuild:', error);
    alert('Erro ao iniciar rebuild');
    rebuilding.value = false;
  }
}

async function checkAdmin() {
  loading.value = true;
  
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      isAdmin.value = false;
      loading.value = false;
      return;
    }

    const response = await fetchApi('/api/auth/me');

    if (response.ok) {
      const data = await response.json();
      isAdmin.value = data.user.role === 'admin';
    } else {
      isAdmin.value = false;
    }
  } catch (error) {
    console.error('Error checking admin:', error);
    isAdmin.value = false;
  } finally {
    loading.value = false;
  }
}

function goHome() {
  window.location.href = '/';
}

onMounted(() => {
  checkAdmin();
});
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
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

.access-denied h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.btn-rebuild {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-rebuild:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}

.btn-rebuild:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-content h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.subtitle {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}
</style>
