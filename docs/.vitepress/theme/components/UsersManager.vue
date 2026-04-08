<template>
  <div class="users-manager">
    <div class="header">
      <h2>👥 Gerenciar Usuários</h2>
      <button @click="showAddModal = true" class="btn-primary">
        ➕ Novo Usuário
      </button>
    </div>

    <div v-if="loading" class="loading">Carregando usuários...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="users-table">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['badge', `badge-${user.role}`]">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>
              <span :class="['status', user.active ? 'active' : 'inactive']">
                {{ user.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <div class="actions">
                <button @click="editUser(user)" class="btn-icon" title="Editar">
                  ✏️
                </button>
                <button 
                  @click="confirmDelete(user)" 
                  class="btn-icon btn-danger"
                  title="Deletar"
                  :disabled="user.id === currentUserId"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Adicionar/Editar -->
    <div v-if="showAddModal || editingUser" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário' }}</h3>
        
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Nome *</label>
            <input v-model="formData.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="formData.email" type="email" required />
          </div>

          <div v-if="!editingUser" class="form-group">
            <label>Senha *</label>
            <input v-model="formData.password" type="password" required minlength="6" />
          </div>

          <div class="form-group">
            <label>Role *</label>
            <select v-model="formData.role" required>
              <option value="guest">Visitante</option>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div v-if="editingUser" class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.active" type="checkbox" />
              Usuário ativo
            </label>
          </div>

          <div v-if="formError" class="error-message">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Delete -->
    <div v-if="deletingUser" class="modal-overlay" @click="deletingUser = null">
      <div class="modal-content modal-small" @click.stop>
        <h3>⚠️ Confirmar Exclusão</h3>
        <p>Tem certeza que deseja deletar o usuário <strong>{{ deletingUser.name }}</strong>?</p>
        <p class="warning-text">Esta ação não pode ser desfeita!</p>
        
        <div class="modal-actions">
          <button @click="deletingUser = null" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteUser" class="btn-danger" :disabled="saving">
            {{ saving ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['refresh']);

const users = ref([]);
const loading = ref(true);
const error = ref('');
const showAddModal = ref(false);
const editingUser = ref(null);
const deletingUser = ref(null);
const saving = ref(false);
const formError = ref('');
const currentUserId = ref(null);

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'user',
  active: true
});

function getRoleLabel(role) {
  const labels = {
    'admin': 'Admin',
    'user': 'Usuário',
    'guest': 'Visitante'
  };
  return labels[role] || role;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadUsers() {
  loading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      users.value = data.users;
    } else {
      error.value = 'Erro ao carregar usuários';
    }
  } catch (err) {
    error.value = 'Erro de conexão';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function getCurrentUser() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      currentUserId.value = data.user.id;
    }
  } catch (err) {
    console.error(err);
  }
}

function editUser(user) {
  editingUser.value = user;
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    active: user.active === 1
  };
}

function confirmDelete(user) {
  deletingUser.value = user;
}

function closeModal() {
  showAddModal.value = false;
  editingUser.value = null;
  formError.value = '';
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  };
}

async function saveUser() {
  saving.value = true;
  formError.value = '';

  try {
    const token = localStorage.getItem('auth_token');
    const url = editingUser.value 
      ? `http://localhost:3000/api/users/${editingUser.value.id}`
      : 'http://localhost:3000/api/users';
    
    const method = editingUser.value ? 'PUT' : 'POST';
    
    const body = editingUser.value
      ? {
          name: formData.value.name,
          email: formData.value.email,
          role: formData.value.role,
          active: formData.value.active ? 1 : 0
        }
      : {
          name: formData.value.name,
          email: formData.value.email,
          password: formData.value.password,
          role: formData.value.role
        };

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      closeModal();
      await loadUsers();
    } else {
      formError.value = data.error || 'Erro ao salvar usuário';
    }
  } catch (err) {
    formError.value = 'Erro de conexão';
    console.error(err);
  } finally {
    saving.value = false;
  }
}

async function deleteUser() {
  saving.value = true;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:3000/api/users/${deletingUser.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      deletingUser.value = null;
      await loadUsers();
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao deletar usuário');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadUsers();
  getCurrentUser();
});
</script>

<style scoped>
.users-manager {
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

.users-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--vp-c-bg);
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  color: var(--vp-c-text-1);
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background: var(--vp-c-bg-soft);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-admin {
  background: #dbeafe;
  color: #1e40af;
}

.badge-user {
  background: #d1fae5;
  color: #065f46;
}

.badge-guest {
  background: #f3f4f6;
  color: #374151;
}

.dark .badge-admin {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.dark .badge-user {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.dark .badge-guest {
  background: rgba(156, 163, 175, 0.2);
  color: #d1d5db;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.dark .status.active {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.dark .status.inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
  transform: scale(1.1);
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon.btn-danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #dc2626;
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

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
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
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 400px;
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

.warning-text {
  color: #dc2626;
  font-weight: 500;
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
