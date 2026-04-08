<template>
  <div class="permissions-manager">
    <div class="header">
      <h2>🔐 Gerenciar Permissões</h2>
      <button @click="showAddModal = true" class="btn-primary">
        ➕ Nova Permissão
      </button>
    </div>

    <div class="info-box">
      <p><strong>💡 Como funciona:</strong></p>
      <p>Configure quais roles (papéis) podem acessar cada página da wiki.</p>
      <p>• <strong>Guest</strong>: Visitantes sem login</p>
      <p>• <strong>User</strong>: Usuários autenticados</p>
      <p>• <strong>Admin</strong>: Administradores (acesso total)</p>
    </div>

    <div v-if="loading" class="loading">Carregando permissões...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="permissions-grid">
      <div v-for="role in roles" :key="role" class="role-section">
        <h3>{{ getRoleLabel(role) }}</h3>
        
        <div class="permissions-list">
          <div 
            v-for="perm in getPermissionsByRole(role)" 
            :key="`${perm.role}-${perm.page}`"
            class="permission-item"
          >
            <div class="permission-info">
              <span class="page-path">{{ perm.page }}</span>
              <span :class="['access-badge', perm.can_access ? 'allowed' : 'denied']">
                {{ perm.can_access ? '✅ Permitido' : '❌ Negado' }}
              </span>
            </div>
            <div class="permission-actions">
              <button 
                @click="togglePermission(perm)" 
                class="btn-toggle"
                :title="perm.can_access ? 'Negar acesso' : 'Permitir acesso'"
              >
                {{ perm.can_access ? '🔒 Negar' : '🔓 Permitir' }}
              </button>
            </div>
          </div>

          <div v-if="getPermissionsByRole(role).length === 0" class="empty-state">
            Nenhuma permissão configurada
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar Permissão -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>➕ Nova Permissão</h3>
        
        <form @submit.prevent="addPermission">
          <div class="form-group">
            <label>Role *</label>
            <select v-model="formData.role" required>
              <option value="guest">Visitante</option>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div class="form-group">
            <label>Página *</label>
            <input 
              v-model="formData.page" 
              type="text" 
              placeholder="/minha-pagina/"
              required 
            />
            <small>Exemplo: /documentacao/ ou /api/</small>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.can_access" type="checkbox" />
              Permitir acesso
            </label>
          </div>

          <div v-if="formError" class="error-message">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchApi } from '../utils/api.js';

const permissions = ref([]);
const loading = ref(true);
const error = ref('');
const showAddModal = ref(false);
const saving = ref(false);
const formError = ref('');

const roles = ['guest', 'user', 'admin'];

const formData = ref({
  role: 'user',
  page: '',
  can_access: true
});

function getRoleLabel(role) {
  const labels = {
    'admin': '👑 Administrador',
    'user': '👤 Usuário',
    'guest': '👁️ Visitante'
  };
  return labels[role] || role;
}

function getPermissionsByRole(role) {
  return permissions.value.filter(p => p.role === role);
}

async function loadPermissions() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetchApi('/api/users/permissions');

    if (response.ok) {
      const data = await response.json();
      permissions.value = data.permissions;
    } else {
      error.value = 'Erro ao carregar permissões';
    }
  } catch (err) {
    error.value = 'Erro de conexão';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function togglePermission(perm) {
  try {
    const response = await fetchApi('/api/users/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: perm.role,
        page: perm.page,
        can_access: !perm.can_access
      })
    });

    if (response.ok) {
      await loadPermissions();
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao atualizar permissão');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  }
}

async function addPermission() {
  saving.value = true;
  formError.value = '';

  try {
    const response = await fetchApi('/api/users/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: formData.value.role,
        page: formData.value.page,
        can_access: formData.value.can_access
      })
    });

    const data = await response.json();

    if (response.ok) {
      closeModal();
      await loadPermissions();
    } else {
      formError.value = data.error || 'Erro ao adicionar permissão';
    }
  } catch (err) {
    formError.value = 'Erro de conexão';
    console.error(err);
  } finally {
    saving.value = false;
  }
}

function closeModal() {
  showAddModal.value = false;
  formError.value = '';
  formData.value = {
    role: 'user',
    page: '',
    can_access: true
  };
}

onMounted(() => {
  loadPermissions();
});
</script>

<style scoped>
.permissions-manager {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--vp-c-text-1);
}

.info-box {
  background: var(--vp-c-brand-soft);
  border-left: 4px solid var(--vp-c-brand-1);
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-bottom: 2rem;
}

.info-box p {
  margin: 0.5rem 0;
  color: var(--vp-c-text-1);
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.role-section {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
}

.role-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--vp-c-text-1);
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.permission-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.page-path {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.access-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.access-badge.allowed {
  background: #d1fae5;
  color: #065f46;
}

.access-badge.denied {
  background: #fee2e2;
  color: #991b1b;
}

.dark .access-badge.allowed {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.dark .access-badge.denied {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.permission-actions {
  margin-left: 1rem;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-toggle:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.dark .error-message {
  background: rgba(220, 38, 38, 0.1);
  color: #fca5a5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.error {
  color: #dc2626;
}
</style>
